<script setup lang="ts">
import type { UITabItemProps } from './UITabs.types'
import { UI_TABS_KEY } from './UITabs.types'

const props = defineProps<UITabItemProps>()

// A tab can be either a button (v-model) or a link (routing) — hence component :is.
const NuxtLink = resolveComponent('NuxtLink')

// null fallback: the item doesn't crash outside UITabs (e.g. in a styleguide/storybook).
const tabs = inject(UI_TABS_KEY, null)

// Size is set once on the container; the prop on the item is a targeted override.
const sizeComputed = computed(() => props.size ?? tabs?.size.value ?? 'default')

const isSelected = computed(() => {
  if (tabs?.modelValue.value === undefined || props.value === undefined) {
    return false
  }

  return tabs.modelValue.value === props.value
})

const onClick = () => {
  if (props.disabled) {
    return
  }

  if (props.value !== undefined) {
    tabs?.updateModelValue(props.value)
  }
}

const stateClasses = computed(() => {
  if (tabs?.variant.value === 'bordered') {
    return isSelected.value
      ? 'bg-muted text-primary'
      : 'text-secondary hover:bg-background'
  }

  return isSelected.value
    ? 'bg-surface text-primary shadow-sm'
    : 'text-secondary hover:text-primary'
})
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    role="tab"
    :aria-selected="isSelected"
    :aria-label="ariaLabel"
    class="ui-tab-item flex flex-1 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200"
    :class="[
      stateClasses,
      disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer',
      sizeComputed === 'large' ? 'px-6 py-2 text-base' : 'px-4 py-1.5 text-sm',
    ]"
    @click="onClick"
  >
    <span v-if="label">{{ label }}</span>
    <slot v-else />
  </component>
</template>
