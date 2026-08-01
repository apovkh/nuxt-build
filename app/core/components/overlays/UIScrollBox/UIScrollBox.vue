<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    direction?: 'horizontal' | 'vertical' | 'both'
    thin?: boolean
    maxHeight?: string
    maxWidth?: string
    shadow?: boolean
  }>(),
  {
    direction: 'vertical',
    thin: true,
    maxHeight: undefined,
    maxWidth: undefined,
    shadow: true,
  },
)

const attrs = useAttrs()

const classes = computed(() => [
  attrs.class,
  'ui-scroll-box',
  `ui-scroll-box--${props.direction}`,
  {
    'ui-scroll-box--thin': props.thin,
  },
])

const forwardedAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class

  return rest
})

const styles = computed(() => ({
  ...(props.maxHeight ? { maxHeight: props.maxHeight } : {}),
  ...(props.maxWidth ? { maxWidth: props.maxWidth } : {}),
}))

const rootRef = ref<HTMLElement | null>(null)

const showShadows = computed(() => props.shadow && props.direction !== 'horizontal')

const { yState } = useScrollExtended(rootRef)

const canScrollUp = computed(() => showShadows.value && yState.hasScrollbar && !yState.arrivedTop)
const canScrollDown = computed(() => showShadows.value && yState.hasScrollbar && !yState.arrivedBottom)
</script>

<template>
  <div
    ref="rootRef"
    :class="classes"
    :style="styles"
    v-bind="forwardedAttrs"
    data-id="ui-scroll-box"
  >
    <div
      v-if="$slots.heading"
      class="ui-scroll-box__heading"
      :class="{ 'ui-scroll-box__heading--scrolled': showShadows && canScrollUp }"
    >
      <slot name="heading" />
    </div>
    <div
      v-else-if="showShadows"
      class="ui-scroll-box__shadow ui-scroll-box__shadow--top"
      :class="{ 'ui-scroll-box__shadow--visible': canScrollUp }"
    />

    <slot />

    <div
      v-if="showShadows"
      class="ui-scroll-box__shadow ui-scroll-box__shadow--bottom"
      :class="{ 'ui-scroll-box__shadow--visible': canScrollDown }"
    />
  </div>
</template>

<style lang="scss">
.ui-scroll-box {
  @apply
    pr-2
  ;
  &--horizontal {
    @apply overflow-x-auto overflow-y-hidden;
  }

  &--vertical {
    @apply overflow-y-auto overflow-x-hidden;
  }

  &--both {
    @apply overflow-auto;
  }

  &__heading {
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgb(var(--v-theme-surface));

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      top: 100%;
      height: 14px;
      background: linear-gradient(to bottom, rgb(var(--v-theme-primary) / 0.1), transparent);
      opacity: 0;
      transition: opacity 0.15s ease;
      pointer-events: none;
    }

    &--scrolled::after {
      opacity: 1;
    }
  }

  &__shadow {
    position: sticky;
    z-index: 1;
    height: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      height: 14px;
    }

    &--top {
      top: 0;

      &::after {
        top: 0;
        background: linear-gradient(to bottom, rgb(var(--v-theme-primary) / 0.1), transparent);
      }
    }

    &--bottom {
      bottom: 0;

      &::after {
        bottom: 0;
        background: linear-gradient(to top, rgb(var(--v-theme-primary) / 0.1), transparent);
      }
    }

    &--visible {
      opacity: 1;
    }
  }

  &--thin {
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--v-theme-border)) transparent;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 9999px;
      background-color: rgb(var(--v-theme-border));

      &:hover {
        background-color: rgba(var(--v-theme-secondary), 0.45);
      }
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }
  }
}
</style>
