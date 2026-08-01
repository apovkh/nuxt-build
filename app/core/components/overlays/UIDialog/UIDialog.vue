<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import { useVModel } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import { captureFocusRestoreTarget, restoreFocusToElement } from '../../../utils/focusRestore'

const props = withDefaults(
  defineProps<{
    maxWidth?: string
    modelValue: boolean
    title?: string
    fullscreen?: boolean
    persistent?: boolean
    width?: string
    retainFocus?: boolean
    headerClass?: string
  }>(),
  {
    maxWidth: undefined,
    persistent: false,
    retainFocus: true,
  },
)

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const proxiedModelValue = useVModel(props, 'modelValue')

const savedOpenFocusEl = ref<HTMLElement | null>(null)

function snapshotOpenFocus() {
  savedOpenFocusEl.value = captureFocusRestoreTarget()
}

if (props.modelValue)
  snapshotOpenFocus()

watch(
  proxiedModelValue,
  (open) => {
    if (open) {
      snapshotOpenFocus()
    }
    else {
      const el = savedOpenFocusEl.value
      savedOpenFocusEl.value = null
      void nextTick(() => {
        restoreFocusToElement(el)
      })
    }
  },
  { flush: 'sync' },
)

const onClose = () => {
  proxiedModelValue.value = false
}

const display = useDisplay()
const scrollableRef = useTemplateRef<HTMLElement>('scrollableRef')
const { yState } = useScrollExtended(scrollableRef)
const slots = useSlots() as any
const withFooter = computed(() => !!slots.footer)

const hasFooterShadow = computed(() => {
  return yState.hasScrollbar && !yState.arrivedBottom && withFooter.value
})
</script>

<template>
  <VDialog
    v-model="proxiedModelValue"
    class="ui-dialog"
    :max-width="fullscreen ? 'none' : maxWidth"
    :width="width"
    scrollable
    :fullscreen="display.smAndDown.value || fullscreen"
    :persistent="persistent"
    :retain-focus="retainFocus"
    data-id="ui-dialog"
  >
    <VCard>
      <div
        class="flex items-start justify-between px-8 pt-4 pb-2 border-b border-gray-200 relative"
        :class="headerClass"
      >
        <h3 class="text-2xl font-semibold leading-6 text-gray-900 py-2">
          <slot name="title">
            {{ title }}
          </slot>
        </h3>

        <UIBtn
          icon
          title="close"
          aria-label="close"
          variant="text"
          color="secondary"
          size="small"
          class="-my-2 -mr-5 shrink-0 self-center"
          @click="onClose"
        >
          <UIIcon :icon="mdiClose" size="24" />
        </UIBtn>
      </div>

      <div
        ref="scrollableRef"
        class="px-8 pb-6 pt-4 overflow-auto grow flex flex-col"
      >
        <slot />
      </div>
      <div
        v-if="$slots.footer"
        class="a-dialog-footer"
        :class="[
          {
            'a-dialog-footer--shadow': hasFooterShadow,
          },
        ]"
      >
        <slot name="footer" />
      </div>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.v-overlay.ui-dialog {
  --v-overlay-opacity: 1;

  .v-overlay__scrim {
    background: rgba(var(--v-theme-brand-primary), 0.15);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
}
</style>

<style lang="scss" scoped>
.a-dialog-footer {
  @apply
    px-8
    py-4
    border-t
    border-gray-200
    transition-all
    flex
  ;

  &--shadow {
    box-shadow: 0 -4px 4px -2px rgba(0, 0, 0, 0.1);
  }
}
</style>
