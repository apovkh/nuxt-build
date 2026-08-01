<script lang="ts" setup>
import { VIcon } from 'vuetify/components'

// Vuetify does not export its IconValue type publicly. The kit only ever passes
// SVG path strings from @mdi/js, which is the shape VIcon accepts here.
type IconValue = string

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    icon?: IconValue
    color?: string
    // Vuetify's own size vocabulary (or a raw px value) — passed to VIcon as-is.
    size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large' | number | string
    start?: boolean
    end?: boolean
    disabled?: boolean
    rotate?: number
    hoverColor?: string
  }>(),
  {
    icon: undefined,
    color: undefined,
    size: 'default',
    start: false,
    end: false,
    disabled: false,
    rotate: 0,
    hoverColor: undefined,
  },
)

const $attrs = useAttrs()

const classes = computed(() => [
  $attrs.class,
  'ui-icon',
  {
    'ui-icon--disabled': props.disabled,
    'ui-icon--hoverable': !!props.hoverColor,
  },
])

const styles = computed(() => ({
  ...(props.rotate ? { transform: `rotate(${props.rotate}deg)` } : {}),
  ...(props.hoverColor ? { '--ui-icon-hover-color': `rgb(var(--v-theme-${props.hoverColor}))` } : {}),
}))
</script>

<template>
  <VIcon
    :class="classes"
    :style="styles"
    :icon="icon"
    :color="color"
    :size="size"
    :start="start"
    :end="end"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </VIcon>
</template>

<style lang="scss">
.ui-icon {
  @apply transition-all duration-200;

  &--disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  &--hoverable {
    @apply cursor-pointer;

    &:hover {
      color: var(--ui-icon-hover-color) !important;
    }
  }
}
</style>
