<script setup lang="ts">
import type {
  IExampleEmits,
  IExampleExpose,
  IExampleProps,
  IExampleSlots,
} from './_Example.types'

defineOptions({ name: 'AExample', inheritAttrs: false })

const props = withDefaults(defineProps<IExampleProps>(), {
  variant: 'default',
  disabled: false,
})
const emit = defineEmits<IExampleEmits>()
defineSlots<IExampleSlots>()

const rootRef = ref<HTMLElement | null>(null)
const internal = ref(props.modelValue)

const formatted = computed(() => `${internal.value} (${props.variant})`)

watch(() => props.modelValue, (value: string) => {
  if (value !== internal.value)
    internal.value = value
})

const update = (value: string) => {
  if (props.disabled)
    return

  internal.value = value
  emit('update:modelValue', value)
}

const submit = () => emit('submit', internal.value)
const reset = () => update('')
const focus = () => rootRef.value?.focus()

defineExpose<IExampleExpose>({ reset, focus })
</script>

<template>
  <div
    ref="rootRef"
    class="a-example" :class="[`a-example--${variant}`, { 'a-example--disabled': disabled }]"
    v-bind="$attrs"
  >
    <slot name="prepend" />

    <slot :value="internal">
      {{ formatted }}
    </slot>

    <div class="a-example__actions">
      <button :disabled="disabled" @click="update(`${internal}!`)">
        Append
      </button>
      <button :disabled="disabled" @click="submit">
        Submit
      </button>
      <button :disabled="disabled" @click="reset">
        Reset
      </button>
    </div>

    <slot name="append" />
  </div>
</template>

<style scoped>
.a-example {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.a-example--disabled {
  opacity: 0.5;
  pointer-events: none;
}
.a-example__actions {
  display: flex;
  gap: 0.5rem;
}
</style>
