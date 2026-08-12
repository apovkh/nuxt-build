<script lang="ts" setup>
import type { UIBtnProps } from './UIBtn.types'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<UIBtnProps>(),
  {
    type: 'button',
    tag: 'button',
    color: 'brand-primary',
    disabled: false,
    size: 'default',
    variant: 'flat',
    icon: false,
    attributes: null,
    ripple: true,
    rounded: false,
    loading: false,
    active: false,
    alignStart: false,
    dark: false,
    appendIcon: undefined,
    prependIcon: undefined,
    fontWeight: 'semibold',
    hoverColor: undefined,
  },
)

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'mouseover', value: MouseEvent): void
  (e: 'mouseenter', value: MouseEvent): void
  (e: 'mouseleave', value: MouseEvent): void
  (e: 'mousedown', value: MouseEvent): void
  (e: 'mouseup', value: MouseEvent): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}>()

const attrs = useAttrs()

const classes = computed(() => [
  attrs.class,
  'ui-btn',
  `font-${props.fontWeight}`,
  {
    'ui-btn--rounded': props.rounded,
    'ui-btn--border': props.border,
    'ui-btn--align-start': props.alignStart,
    'ui-btn--dark': props.dark,
    'ui-btn--hover-color': !!props.hoverColor,
  },
])

const styles = computed(() => {
  const result: Record<string, string> = {}

  if (props.hoverColor) {
    result['--ui-btn-hover-color'] = `rgb(var(--v-theme-${props.hoverColor}))`
  }

  return result
})

const ariaLabelMerged = computed(
  () => props.ariaLabel ?? attrs['aria-label'] as string | undefined,
)

const isLinkLikeControl = computed(() => {
  const attributes = props.attributes ?? {}
  const hrefFromAttributes = typeof attributes.href === 'string' && attributes.href.length > 0
  const hrefFromAttrs = typeof attrs.href === 'string' && attrs.href.length > 0

  return Boolean(props.to || hrefFromAttributes || hrefFromAttrs || props.tag === 'a')
})

function coerceAriaExpanded(value: boolean | string): boolean {
  if (typeof value === 'boolean')
    return value

  return value === 'true'
}

const mergedAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  delete rest.style
  delete rest['aria-label']

  // Same-named props override raw attrs — but only when they were actually passed.
  // Otherwise aria-pressed/aria-expanded passed as attrs would simply vanish.
  if (props.ariaPressed !== undefined)
    delete rest['aria-pressed']

  if (props.ariaExpanded !== undefined)
    delete rest['aria-expanded']

  return {
    ...rest,
    ...(props.attributes ?? {}),
    ...(!isLinkLikeControl.value && props.ariaPressed !== undefined && {
      'aria-pressed': props.ariaPressed === 'mixed' ? 'mixed' : props.ariaPressed,
    }),
    ...(!isLinkLikeControl.value && props.ariaExpanded !== undefined && {
      'aria-expanded': coerceAriaExpanded(props.ariaExpanded),
    }),
    ...(props.ariaControls !== undefined && { 'aria-controls': props.ariaControls }),
  }
})
</script>

<template>
  <VBtn
    :class="classes"
    :style="[styles, attrs.style]"
    :tag="tag"
    :color="color"
    :disabled="disabled"
    :size="size"
    :variant="variant"
    :ripple="ripple"
    :to="to"
    :icon="icon"
    :loading="loading"
    :type="type"
    :active="active"
    :append-icon="appendIcon"
    :aria-label="ariaLabelMerged"
    :prepend-icon="prependIcon"
    v-bind="mergedAttrs"
    data-id="ui-btn"
    @click="emit('click', $event)"
    @mouseover="emit('mouseover', $event)"
    @mouseenter="emit('mouseenter', $event)"
    @mouseleave="emit('mouseleave', $event)"
    @mousedown="emit('mousedown', $event)"
    @mouseup="emit('mouseup', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <slot />
  </VBtn>
</template>

<style lang="scss">
.ui-btn {
  @apply cursor-pointer;

  &.v-btn {
    @apply normal-case tracking-normal;

    text-indent: 0;
  }

  &.font-normal { font-weight: 400 !important; }
  &.font-medium { font-weight: 500 !important; }
  &.font-semibold { font-weight: 600 !important; }
  &.font-bold { font-weight: 700 !important; }

  .v-btn__overlay {
    transition: opacity 0.3s ease-in-out !important;
  }

  // White outlined on a light surface: the text stays dark (readability),
  // hover is a soft fill, since Vuetify's own overlay is barely visible on light.
  &.v-btn--variant-outlined.text-white:not(.ui-btn--dark) {
    @apply text-primary;

    &:hover {
      @apply bg-muted;
    }
  }

  // Prop `dark` — outlined on a dark surface: white text, muted border,
  // semi-transparent white hover. White comes from the `surface` token (#fff): the
  // text-white utility can't be used here — the file has a .text-white selector,
  // and Tailwind sees that as a circular dependency.
  &.v-btn--variant-outlined.ui-btn--dark {
    @apply border-surface/25 text-surface;

    &:hover {
      @apply bg-surface/10;
    }
  }

  &:not(.ui-btn--rounded) {
    @apply rounded;
  }

  &.ui-btn--rounded {
    @apply rounded-full;
  }

  &.v-btn--size-small {
    .v-progress-circular {
      width: 16px !important;
      height: 16px !important;
    }
  }

  &.ui-btn--border {
    border: 1px solid #f2f2f2;

    &:not(.ui-btn--rounded) .v-btn__overlay {
      border-radius: 3px;
    }
  }

  &.ui-btn--align-start {
    justify-content: flex-start;
  }

  &--hover-color:hover {
    color: var(--ui-btn-hover-color) !important;
  }
}
</style>
