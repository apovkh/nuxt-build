<script lang="ts" setup>
import { useVModel } from '@vueuse/core'

import { VSelect } from 'vuetify/components'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue?: any
    items: any
    itemTitle?: string
    itemValue?: string
    loading?: boolean
    name?: string
    autocomplete?: string
    color?: string
    placeholder?: string
    label?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    clearable?: boolean
    error?: boolean
    errorMessages?: string[]
    hint?: string
    persistentFooter?: boolean
    density?: 'comfortable' | 'compact'
    variant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain'
    appendInnerIcon?: string
    appendIcon?: string
    prependIcon?: string
    prependInnerIcon?: string
    multiple?: boolean
    chips?: boolean
  }>(),
  {
    itemTitle: 'name',
    itemValue: 'value',
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
  },
)

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'mouseover', value: MouseEvent): void
  (e: 'click:append-inner', value: MouseEvent): void
  (e: 'click:append', value: MouseEvent): void
  (e: 'click:prepend-inner', value: MouseEvent): void
  (e: 'click:prepend', value: MouseEvent): void
  (e: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()
const classes = computed(() => {
  return ['ui-select', { 'ui-select--multiple': props.multiple }, attrs.class]
})
const forwardedAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  delete rest['menu-props']
  delete rest.menuProps

  return rest
})

const menuPropsMerged = computed(() => ({
  contentClass: 'ui-select__menu',
  offset: 4,
  ...((attrs['menu-props'] ?? attrs.menuProps ?? {}) as Record<string, unknown>),
}))

const proxiedModelValue = useVModel(props, 'modelValue')

const onClick = (event: MouseEvent) => emit('click', event)
</script>

<template>
  <UILabel
    :class="classes"
    :label="label"
    :hint="hint"
    :required="required"
    :disabled="disabled"
    :error-messages="errorMessages"
    :persistent-footer="persistentFooter"
    data-id="ui-select"
  >
    <template #default="fieldAttrs">
      <VSelect
        v-model="proxiedModelValue"
        v-bind="{ ...forwardedAttrs, ...fieldAttrs }"
        :items="items"
        :item-title="itemTitle"
        :item-value="itemValue"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :error="error || !!errorMessages?.length"
        :color="color"
        :disabled="disabled"
        :readonly="readonly"
        :loading="loading"
        :density="density"
        :variant="variant"
        :menu-props="menuPropsMerged"
        :clearable="clearable"
        :multiple="multiple"
        :chips="chips"
        persistent-clear
        @click="onClick"
      >
        <template
          v-if="$slots.item"
          #item="item"
        >
          <slot
            name="item"
            v-bind="item"
          />
        </template>

        <template
          v-if="$slots.selection"
          #selection="selection"
        >
          <slot
            name="selection"
            v-bind="selection"
          />
        </template>
      </VSelect>
    </template>
  </UILabel>
</template>

<style lang="scss">
.ui-select {
  .v-field {
    @apply rounded-[11px] bg-surface;

    min-height: 36px;
  }

  .v-field__input {
    @apply text-[13.5px] font-semibold text-primary;

    align-items: center;
    min-height: 36px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .v-text-field__prefix {
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

  .v-field__append-inner .v-icon {
    @apply text-secondary opacity-80;
  }

  &--multiple {
    .v-field__input {
      .v-select__selection:first-child {
        max-width: calc(100% - 28px);
      }
    }
  }
}

.ui-select__menu {
  @apply rounded-[12px] border border-border bg-surface shadow-xl;

  overflow: hidden;

  .v-list {
    padding: 6px;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .v-list .v-list-item {
    @apply rounded-[8px] text-primary;

    min-height: 34px;
  }

  .v-list-item-title {
    @apply text-[13px] font-medium;
  }

  .v-list-item__overlay {
    display: none;
  }

  .v-list .v-list-item:hover {
    @apply bg-muted;
  }

  .v-list .v-list-item--active {
    @apply bg-highlight text-primary;

    .v-list-item-title {
      @apply font-semibold;
    }
  }
}
</style>
