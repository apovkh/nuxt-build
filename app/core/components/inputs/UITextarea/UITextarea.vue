<script lang="ts" setup>
import { useVModel } from '@vueuse/core'

import { VTextarea } from 'vuetify/components'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue?: string | undefined | null
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
    name?: string
    autocomplete?: string
    persistentFooter?: boolean
    variant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain'
    rows?: number | string
    autoGrow?: boolean
    noResize?: boolean
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
    counter: 0,
    persistentFooter: false,
    autofocus: false,
    rows: undefined,
    autoGrow: false,
    noResize: false,
  },
)

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'click:append', value: MouseEvent): void
  (e: 'click:append-inner', value: MouseEvent): void
  (e: 'click:prepend', value: MouseEvent): void
  (e: 'click:prepend-inner', value: MouseEvent): void
  (e: 'update:modelValue', value: any): void
  (e: 'keydown', value: KeyboardEvent): void
  (e: 'keyup', value: KeyboardEvent): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}>()

const attrs = useAttrs()
const classes = computed(() => {
  return [
    'ui-textarea',
    attrs.class,
    { 'ui-textarea--no-resize': props.noResize },
  ]
})
const forwardedAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class

  return rest
})

const proxiedModelValue = useVModel(props, 'modelValue')

const onClick = (event: MouseEvent) => emit('click', event)

type Slots = VTextarea['$slots']
type AvailableSlots = Pick<Slots, 'append' | 'prepend' | 'append-inner' | 'prepend-inner'>
type AvailableSlotsKeys = keyof AvailableSlots

const availableSlots: AvailableSlotsKeys[] = ['append', 'prepend', 'append-inner', 'prepend-inner']
const slots = useSlots()

const vuetifyTextareaSlots = computed<Array<AvailableSlotsKeys>>(() => {
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

const textareaRef = ref<InstanceType<typeof VTextarea>>()

defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
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
    data-id="ui-textarea"
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

    <template #default="fieldAttrs">
      <!-- eslint-disable vue/custom-event-name-casing -->
      <VTextarea
        ref="textareaRef"
        v-model="proxiedModelValue"
        v-bind="{ ...forwardedAttrs, ...fieldAttrs }"
        :autofocus="autofocus"
        :placeholder="placeholder"
        :error="error || !!errorMessages?.length"
        :color="color"
        :disabled="disabled"
        :readonly="readonly"
        :density="density"
        :variant="variant"
        :name="name"
        :autocomplete="autocomplete"
        :loading="loading"
        :rows="rows"
        :auto-grow="autoGrow"
        data-id="textarea"
        hide-details
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
          v-for="key in vuetifyTextareaSlots"
          #[key]
        >
          <slot :name="key" />
        </template>
      </VTextarea>
    </template>
  </UILabel>
</template>

<style lang="scss">
.ui-textarea {
  .v-field {
    @apply rounded-[11px] bg-surface;
  }

  .v-field__input {
    @apply text-[13.5px] font-semibold text-primary;

    padding-top: 10px;
    padding-bottom: 10px;
    line-height: 1.45;
  }

  &.ui-textarea--max-height textarea {
    max-height: var(--ui-textarea-max-height);
    overflow-y: auto;
  }

  &.ui-textarea--no-resize textarea {
    resize: none;
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
}
</style>
