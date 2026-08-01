<script lang="ts" setup>
import { useVModel } from '@vueuse/core'

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
    errorMessages?: string[]
    hint?: string
    density?: 'comfortable' | 'compact'
    indeterminate?: boolean
  }>(),
  {
    color: 'brand-primary',
    label: '',
    disabled: false,
    density: 'comfortable',
    error: false,
    readonly: false,
  },
)

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'update:modelValue', value: boolean | any[]): void
}>()

const attrs = useAttrs()
const classes = computed(() => {
  return ['ui-checkbox', attrs.class]
})
const forwardedAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class

  return rest
})

const proxiedModelValue = useVModel(props, 'modelValue')

const onClick = (event: MouseEvent) => emit('click', event)
</script>

<template>
  <UILabel
    :hint="hint"
    :error-messages="errorMessages"
    :class="classes"
    data-id="ui-checkbox"
  >
    <template #default="fieldAttrs">
      <UICheckboxBtn
        v-model="proxiedModelValue"
        v-bind="{ ...forwardedAttrs, ...fieldAttrs }"
        :label="label"
        :value="value"
        :color="color"
        :disabled="disabled"
        :readonly="readonly"
        :density="density"
        :error="error || !!errorMessages?.length"
        :indeterminate="indeterminate"
        @click="onClick"
      >
        <template
          v-for="(_, slotName) in $slots"
          #[slotName]
        >
          <slot :name="slotName" />
        </template>
      </UICheckboxBtn>
    </template>
  </UILabel>
</template>
