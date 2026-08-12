<script lang="ts" setup>
import { useVModel } from '@vueuse/core'

import { VTextField } from 'vuetify/components'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | undefined | null
    color?: string
    placeholder?: string
    label?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    error?: boolean
    errorMessages?: string[]
    hint?: string
    density?: 'comfortable' | 'compact'
    counter?: number | string
    autofocus?: boolean
    loading?: boolean
    type?: string
    min?: number | string
    max?: number | string
    step?: number | string
    name?: string
    autocomplete?: string
    clearable?: boolean
    persistentFooter?: boolean
    prefix?: string
    suffix?: string
    variant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain'
    appendInnerIcon?: string
    appendIcon?: string
    prependIcon?: string
    prependInnerIcon?: string
  }>(),
  {
    color: 'brand-primary',
    placeholder: '',
    label: '',
    required: false,
    disabled: false,
    error: false,
    hint: '',
    density: 'comfortable',
    variant: 'outlined',
    readonly: false,
    prefix: '',
    suffix: '',
    counter: 0,
    persistentFooter: false,
    autofocus: false,
    clearable: false,
  },
)

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'mouseover', value: MouseEvent): void
  (e: 'click:append-inner', value: MouseEvent): void
  (e: 'click:append', value: MouseEvent): void
  (e: 'click:prepend-inner', value: MouseEvent): void
  (e: 'click:prepend', value: MouseEvent): void
  (e: 'update:modelValue', value: any): void
  (e: 'keydown', value: KeyboardEvent): void
  (e: 'keyup', value: KeyboardEvent): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}>()

const attrs = useAttrs()
const classes = computed(() => {
  return ['ui-text-field', attrs.class]
})
const forwardedAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class

  return rest
})

const proxiedModelValue = useVModel(props, 'modelValue')

const onClick = (event: MouseEvent) => emit('click', event)

type Slots = VTextField['$slots']
type AvailableSlots = Pick<Slots, 'append' | 'prepend' | 'append-inner' | 'prepend-inner'>
type AvailableSlotsKeys = keyof AvailableSlots

const availableSlots: AvailableSlotsKeys[] = ['append', 'prepend', 'append-inner', 'prepend-inner']
const slots = useSlots()

const vuetifyTextFieldSlots = computed<Array<AvailableSlotsKeys>>(() => {
  const keys = Object.keys(slots)
  const returnKeys = keys.filter((key: string) => {
    const k = key as keyof Slots | string

    return availableSlots.includes(k as AvailableSlotsKeys)
  })

  return returnKeys as AvailableSlotsKeys[]
})

const currentCounter = computed(() => {
  if (typeof props.modelValue === 'string')
    return props.modelValue.length

  return 0
})

const textFieldRef = ref<InstanceType<typeof VTextField>>()

defineExpose({
  focus: () => textFieldRef.value?.focus(),
  blur: () => textFieldRef.value?.blur(),
})
</script>

<template>
  <UILabel
    :class="classes"
    :label="label"
    :hint="hint"
    :required="required"
    :disabled="disabled"
    :error-messages="errorMessages"
    :counter="counter"
    :counter-current="currentCounter"
    :persistent-footer="persistentFooter"
    data-id="ui-text-field"
  >
    <template
      v-if="$slots.label"
      #label
    >
      <slot name="label" />
    </template>

    <template
      v-if="$slots.hint"
      #hint
    >
      <slot name="hint" />
    </template>

    <!-- fieldAttrs — id + aria-* from UILabel: they are what ties the <label> to the input. -->
    <template #default="fieldAttrs">
      <!-- eslint-disable vue/custom-event-name-casing -->
      <VTextField
        ref="textFieldRef"
        v-model="proxiedModelValue"
        v-bind="{ ...forwardedAttrs, ...fieldAttrs }"
        :autofocus="autofocus"
        :placeholder="placeholder"
        :error="error || !!errorMessages?.length"
        :color="color"
        :disabled="disabled"
        :readonly="readonly"
        :append-inner-icon="appendInnerIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :prepend-icon="prependIcon"
        :density="density"
        :variant="variant"
        :prefix="prefix"
        :suffix="suffix"
        :type="type"
        :name="name"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        :loading="loading"
        :clearable="clearable"
        data-id="textfield"
        hide-details
        persistent-clear
        @click:append="$emit('click:append', $event)"
        @click:append-inner="$emit('click:append-inner', $event)"
        @click:prepend="$emit('click:prepend', $event)"
        @click:prepend-inner="$emit('click:prepend-inner', $event)"
        @keydown="$emit('keydown', $event)"
        @keyup="$emit('keyup', $event)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @click="onClick"
      >
        <template
          v-for="key in vuetifyTextFieldSlots"
          #[key]
        >
          <slot :name="key" />
        </template>
      </VTextField>
    </template>
  </UILabel>
</template>

<style lang="scss">
.ui-text-field {
  .v-field {
    @apply rounded-[11px] bg-surface;

    min-height: 36px;
  }

  // When the field is stretched beyond min-height (a flex row with a button),
  // Vuetify leaves the input at the top — center the content vertically.
  .v-field__field {
    align-items: center;
  }

  .v-field__input {
    @apply text-[13.5px] font-semibold text-primary;

    align-items: center;
    min-height: 36px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .v-text-field__prefix,
  .v-text-field__suffix {
    @apply text-[13px] font-medium text-secondary;

    align-items: center;
    min-height: 36px;
    padding-top: 0;
    padding-bottom: 0;
    opacity: 1;
  }

  .v-field__outline {
    --v-field-border-opacity: 1;

    color: rgb(var(--v-theme-border));
  }

  .v-field:hover .v-field__outline {
    color: rgba(var(--v-theme-brand-primary), 0.4);
  }

  .v-field--focused .v-field__outline {
    --v-field-border-width: 1.5px;

    color: rgb(var(--v-theme-brand-primary));
  }

  /* The error state must come AFTER the base outline rules: they set the border
     color from the token and would otherwise override Vuetify's red. */
  .v-field--error .v-field__outline,
  .v-field--error:hover .v-field__outline {
    color: rgb(var(--v-theme-error));
  }

  .v-field__outline__start {
    flex-basis: 11px;
    border-radius: 11px 0 0 11px;
  }

  .v-field__outline__end {
    border-radius: 0 11px 11px 0;
  }

  .v-field__append-inner .v-icon,
  .v-field__prepend-inner .v-icon {
    @apply text-secondary opacity-80;
  }

  .v-icon--clickable {
    cursor: inherit;
  }
}
</style>
