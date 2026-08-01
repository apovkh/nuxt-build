import type { RouteLocationRaw } from 'vue-router'

export const UI_LINK_TARGET = {
  SELF: '_self',
  BLANK: '_blank',
  PARENT: '_parent',
  TOP: '_top',
} as const

export type UILinkTarget = typeof UI_LINK_TARGET[keyof typeof UI_LINK_TARGET]
export type UILinkVariant = 'primary' | 'nav' | 'ghost' | 'text' | 'unstyled'

export interface UILinkProps {
  to?: RouteLocationRaw
  variant?: UILinkVariant
  target?: UILinkTarget
  query?: Record<string, string | number | boolean | undefined>
  wrapper?: boolean
  disabled?: boolean
  download?: boolean | string
  showExternalIcon?: boolean
  autoExternalTarget?: boolean
  scrollOffset?: number
  smoothScroll?: boolean
  name?: string
  testId?: string
}
