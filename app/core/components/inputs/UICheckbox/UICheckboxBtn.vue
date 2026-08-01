<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { VCheckboxBtn } from 'vuetify/components'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue?: boolean | any[]
    value?: any
    color?: string
    label?: string
    disabled?: boolean
    readonly?: boolean
    error?: boolean
    density?: 'comfortable' | 'compact'
    ripple?: boolean
    hoverRipple?: boolean
    indeterminate?: boolean
    ariaLabel?: string
  }>(),
  {
    color: 'brand-primary',
    label: '',
    disabled: false,
    density: 'comfortable',
    error: false,
    readonly: false,
    ripple: true,
    hoverRipple: true,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'update:modelValue', value: boolean | any[]): void
}>()

const attrs = useAttrs()
const classes = computed(() => {
  return [
    'ui-checkbox-btn',
    attrs.class,
    {
      'ui-checkbox-btn--no-hover-ripple': !props.hoverRipple,
    },
  ]
})
const forwardedAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class

  return rest
})

const proxiedModelValue = useVModel(props, 'modelValue')
const checkboxRef = ref<InstanceType<typeof VCheckboxBtn> | null>(null)

const onClick = (event: MouseEvent) => emit('click', event)

const slots = useSlots()
const slotsKeys = computed(() => {
  return Object.keys(slots) as Array<'label'>
})
</script>

<template>
  <VCheckboxBtn
    ref="checkboxRef"
    v-model="proxiedModelValue"
    v-bind="forwardedAttrs"
    :class="classes"
    :label="label"
    :color="color"
    :disabled="disabled"
    :readonly="$props.readonly"
    :density="density"
    :ripple="ripple"
    :error="error"
    :value="value"
    :indeterminate="indeterminate"
    :aria-label="ariaLabel"
    data-id="ui-checkbox-btn"
    @click="onClick"
  >
    <template
      v-for="slotName in slotsKeys"
      #[slotName]
    >
      <slot :name="slotName" />
    </template>
  </VCheckboxBtn>
</template>

<style lang="scss">
.ui-checkbox-btn {
  &--no-hover-ripple {
    .v-selection-control__input::before {
      opacity: 0 !important;
    }
  }

  .v-label {
    @apply text-[13px] font-medium text-primary;

    opacity: 1;
  }

  .v-selection-control__input .v-icon {
    color: rgba(var(--v-theme-secondary), 0.6);
  }

  &.v-selection-control--dirty .v-selection-control__input .v-icon {
    color: currentcolor;
  }

  &.v-selection-control--density-comfortable {
    --v-selection-control-size: 34px;
  }

  &.v-selection-control--density-compact {
    --v-selection-control-size: 26px;
  }
}
</style>
