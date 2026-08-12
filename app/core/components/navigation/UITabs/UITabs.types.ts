import type { InjectionKey, Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type UITabValue = string | number
export type UITabsVariant = 'default' | 'bordered'
export type UITabsSize = 'default' | 'large'

export interface UITabItemProps {
  label?: string
  value?: UITabValue
  to?: RouteLocationRaw
  disabled?: boolean
  size?: UITabsSize
  ariaLabel?: string
}

export interface UITabsContext {
  modelValue: Ref<UITabValue | undefined>
  variant: Ref<UITabsVariant>
  size: Ref<UITabsSize>
  updateModelValue: (value: UITabValue) => void
}

// Typed key so the provide/inject contract between UITabs and UITabItem
// is checked by the compiler rather than by string matching.
export const UI_TABS_KEY: InjectionKey<UITabsContext> = Symbol('ui-tabs')
