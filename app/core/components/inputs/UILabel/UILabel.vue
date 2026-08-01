<script setup lang="ts">
import { mdiHelpCircleOutline } from '@mdi/js'

const props = withDefaults(
  defineProps<{
    label?: string
    hint?: string
    required?: boolean
    disabled?: boolean
    errorMessages?: string[]
    counter?: number | string
    counterCurrent?: number
    persistentFooter?: boolean
  }>(),
  {
    label: '',
    hint: '',
    required: false,
    disabled: false,
    errorMessages: () => [],
    counter: 0,
    counterCurrent: 0,
    persistentFooter: false,
  },
)

const hasErrors = computed(() => (props.errorMessages?.length ?? 0) > 0)
const hasCounter = computed(() => Number.parseInt(String(props.counter ?? 0)) > 0)
const showFooter = computed(() => props.persistentFooter || hasErrors.value || hasCounter.value)
const isCounterOver = computed(() => !!props.counter && !!props.counterCurrent && Number(props.counterCurrent) > Number(props.counter))

const inputId = useId()
const errorId = computed(() => `${inputId}-error`)

const fieldAttrs = computed(() => ({
  'id': inputId,
  'aria-describedby': hasErrors.value ? errorId.value : undefined,
  'aria-invalid': hasErrors.value ? true : undefined,
  'aria-required': props.required ? true : undefined,
}))
</script>

<template>
  <div
    class="ui-label flex flex-col gap-[3px]"
    data-id="ui-label"
  >
    <div
      v-if="label || hint || $slots.label || $slots.hint"
      class="min-h-[24px] flex items-center text-[12.5px] font-semibold text-primary/80"
      :class="{ 'opacity-40': disabled }"
    >
      <VLabel :for="inputId" class="flex items-center">
        <slot name="label">
          <span>{{ label }}</span>
        </slot>
        <span
          v-if="required && (label || $slots.label)"
          class="text-error text-[18px] ps-1 leading-3 font-bold"
        >*</span>

        <slot name="label-append" />
      </VLabel>

      <div
        v-if="!!$slots.hint || hint"
        class="ms-1 me-2"
      >
        <UIBtn
          icon
          variant="plain"
          color="secondary"
          size="x-small"
          aria-label="Show hint"
        >
          <UIIcon
            size="15"
            :icon="mdiHelpCircleOutline"
          />

          <VMenu
            activator="parent"
            transition="fade-transition"
            :close-on-content-click="false"
            :close-delay="200"
            :open-delay="100"
            offset="3"
            max-width="280"
          >
            <VCard class="!px-3 !py-2 text-sm text-secondary border border-border bg-background">
              <div v-if="hint">
                {{ hint }}
              </div>
              <slot
                v-else
                name="hint"
              />
            </VCard>
          </VMenu>
        </UIBtn>
      </div>
    </div>

    <slot v-bind="fieldAttrs" />

    <VExpandTransition>
      <div v-if="showFooter">
        <div
          class="flex px-1 pt-[2px] min-h-[18px] text-[11px] leading-3 text-secondary"
        >
          <div
            v-if="errorMessages && errorMessages.length"
            :id="errorId"
            class="text-error leading-4"
            role="alert"
          >
            {{ errorMessages[0] }}
          </div>

          <div
            v-if="hasCounter"
            class="ps-2 ms-auto leading-4 tracking-widest"
            :class="{ 'text-error': isCounterOver }"
          >
            {{ counterCurrent }}/{{ counter }}
          </div>
        </div>
      </div>
    </VExpandTransition>
  </div>
</template>

<style lang="scss">
.ui-label {
  > div > .v-label {
    font-size: inherit;
    letter-spacing: inherit;
  }
}
</style>
