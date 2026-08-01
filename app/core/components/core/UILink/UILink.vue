<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import type { UILinkProps, UILinkTarget } from './UILink.types'
import { mdiOpenInNew } from '@mdi/js'
import { UI_LINK_TARGET } from './UILink.types'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<UILinkProps>(),
  {
    to: undefined,
    variant: 'text',
    target: undefined,
    query: undefined,
    wrapper: false,
    disabled: false,
    download: false,
    showExternalIcon: false,
    autoExternalTarget: true,
    scrollOffset: 0,
    smoothScroll: true,
    name: undefined,
    testId: 'ui-link',
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const $attrs = useAttrs()
const router = useRouter()

const {
  analyzeLinkType,
  scrollToElement,
  buildHref,
  getSecurityAttrs,
} = useLinkResolver({
  scrollOffset: props.scrollOffset,
  smoothScroll: props.smoothScroll,
})

const linkInfo = computed(() => analyzeLinkType(props.to))

const useRouterLink = computed(() => {
  if (!props.to || props.wrapper || props.download) {
    return false
  }

  const { isExternal, isMailTo, isTel, isAnchor } = linkInfo.value

  return !isExternal && !isMailTo && !isTel && !isAnchor
})

const computedTarget = computed<UILinkTarget | undefined>(() => {
  if (props.target) {
    return props.target
  }

  if (props.autoExternalTarget && linkInfo.value.isExternal) {
    return UI_LINK_TARGET.BLANK
  }

  return undefined
})

const isTargetValid = computed(() =>
  !!computedTarget.value
  && Object.values(UI_LINK_TARGET).includes(computedTarget.value),
)

const computedHref = computed(() => {
  if (!props.to) {
    return undefined
  }

  const baseHref = linkInfo.value.href

  return props.query ? buildHref(baseHref, props.query) : baseHref
})

// RouterLink отримує props.to як є, тож без цього `query` мовчки губився б саме
// для внутрішніх посилань — найчастішого випадку. Булеві значення приводимо до
// рядка: LocationQueryRaw їх не приймає.
const routerLinkTo = computed<RouteLocationRaw | undefined>(() => {
  if (!props.to || !props.query) {
    return props.to
  }

  const query = Object.fromEntries(
    Object.entries(props.query)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, typeof value === 'boolean' ? String(value) : value]),
  )

  if (typeof props.to === 'string') {
    return { path: props.to, query }
  }

  const target = props.to as Exclude<RouteLocationRaw, string> & { query?: Record<string, unknown> }

  return { ...target, query: { ...target.query, ...query } } as RouteLocationRaw
})

const downloadAttr = computed(() => {
  if (!props.download) {
    return undefined
  }

  return typeof props.download === 'string' ? props.download : ''
})

const securityAttrs = computed(() => getSecurityAttrs(computedTarget.value))

const classes = computed(() => [
  $attrs.class,
  'ui-link',
  `ui-link--${props.variant}`,
  {
    'ui-link--disabled': props.disabled,
    'ui-link--wrapper': props.wrapper,
    'ui-link--external': linkInfo.value.isExternal,
  },
])

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()

    return
  }

  emit('click', event)

  if (linkInfo.value.isAnchor && computedHref.value) {
    event.preventDefault()
    scrollToElement(computedHref.value)

    return
  }

  // Гілка на props.to, а не на computedHref: для об'єктного маршруту
  // ({ name: 'posts' }) analyzeLinkType повертає href: '', і на computedHref
  // wrapper-режим просто не спрацьовував би.
  if (props.wrapper && props.to) {
    event.preventDefault()

    const href = computedHref.value

    if (href && (linkInfo.value.isExternal || linkInfo.value.isMailTo || linkInfo.value.isTel)) {
      if (computedTarget.value && isTargetValid.value) {
        // 'noopener,noreferrer' саме як window features: rel-атрибут із getSecurityAttrs
        // на програмний window.open не поширюється, і сторінка отримала б живий
        // window.opener (reverse tabnabbing).
        window.open(href, computedTarget.value, 'noopener,noreferrer')
      }
      else {
        window.location.href = href
      }
    }
    else {
      router.push(props.to)
    }
  }
}

const restAttrs = computed(() => {
  const rest = { ...$attrs } as Record<string, unknown>
  delete rest.class

  return rest
})

const commonAttrs = computed(() => ({
  // aria-label лише коли його справді передали: інакше він перебиває видимий текст
  // посилання, і скрінрідер читає підпис замість вмісту.
  ...(props.name !== undefined && { 'aria-label': props.name }),
  'data-test-id': props.testId,
  'data-id': 'ui-link',
  'aria-disabled': props.disabled || undefined,
  'tabindex': props.disabled ? -1 : undefined,
}))

const anchorAttrs = computed(() => ({
  ...restAttrs.value,
  ...commonAttrs.value,
  ...securityAttrs.value,
  href: props.disabled ? undefined : computedHref.value,
  target: isTargetValid.value ? computedTarget.value : undefined,
  download: downloadAttr.value,
}))

const wrapperAttrs = computed(() => ({
  ...restAttrs.value,
  ...commonAttrs.value,
  role: 'link',
  // Стиль споживача зберігаємо — курсор лише додаємо зверху.
  style: [$attrs.style, props.disabled ? undefined : { cursor: 'pointer' }],
}))

const buttonAttrs = computed(() => ({
  ...restAttrs.value,
  ...commonAttrs.value,
  type: 'button' as const,
  disabled: props.disabled || undefined,
}))

const routerLinkAttrs = computed(() => ({
  ...restAttrs.value,
  ...commonAttrs.value,
  ...securityAttrs.value,
  target: isTargetValid.value ? computedTarget.value : undefined,
}))
</script>

<template>
  <RouterLink
    v-if="useRouterLink && routerLinkTo"
    :to="routerLinkTo"
    :class="classes"
    v-bind="routerLinkAttrs"
    @click="handleClick"
  >
    <slot />
    <UIIcon
      v-if="showExternalIcon && linkInfo.isExternal"
      :icon="mdiOpenInNew"
      size="small"
      class="ui-link__external-icon"
    />
  </RouterLink>

  <div
    v-else-if="wrapper"
    :class="classes"
    v-bind="wrapperAttrs"
    @click="handleClick"
  >
    <slot />
    <UIIcon
      v-if="showExternalIcon && linkInfo.isExternal"
      :icon="mdiOpenInNew"
      size="small"
      class="ui-link__external-icon"
    />
  </div>

  <a
    v-else-if="computedHref"
    :class="classes"
    v-bind="anchorAttrs"
    @click="handleClick"
  >
    <slot />
    <UIIcon
      v-if="showExternalIcon && linkInfo.isExternal"
      :icon="mdiOpenInNew"
      size="small"
      class="ui-link__external-icon"
    />
  </a>

  <button
    v-else
    :class="classes"
    v-bind="buttonAttrs"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style lang="scss">
.ui-link {
  @apply inline-flex items-center gap-1.5 cursor-pointer;

  &__external-icon {
    @apply opacity-70 shrink-0;
  }

  &--primary {
    @apply
      rounded-[11px]
      bg-brand-primary
      px-[18px]
      py-2.5
      text-[13.5px]
      font-bold
      text-white
      no-underline
      shadow-[0_8px_18px_-8px_rgba(33,158,188,0.6)]
      transition-transform
    ;

    &:not(.ui-link--disabled):hover {
      @apply -translate-y-px;
    }
  }

  &--nav {
    @apply
      text-[13.5px]
      font-semibold
      text-secondary
      no-underline
      transition-colors
    ;

    &:not(.ui-link--disabled):hover {
      @apply text-brand-primary;
    }
  }

  &--ghost {
    @apply
      px-1
      py-2
      text-[13.5px]
      font-semibold
      text-secondary
      no-underline
      transition-colors
    ;

    &:not(.ui-link--disabled):hover {
      @apply text-brand-primary;
    }
  }

  &--text {
    @apply
      font-medium
      text-brand-primary
      no-underline
      underline-offset-2
      transition-colors
    ;

    &:not(.ui-link--disabled):hover {
      @apply underline;
    }
  }

  &--unstyled {
    @apply text-inherit no-underline;
  }

  &--wrapper {
    @apply block;
  }

  &--disabled {
    @apply opacity-50 cursor-not-allowed pointer-events-none;
  }
}
</style>
