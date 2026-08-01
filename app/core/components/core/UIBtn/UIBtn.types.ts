import type { RouteLocationRaw } from 'vue-router'

// Vuetify does not export its IconValue type publicly. The kit only ever passes
// SVG path strings from @mdi/js, which is the shape VIcon accepts here.
type IconValue = string

export interface UIBtnProps {
  tag?: string
  color?: string
  // Vuetify's own size vocabulary — passed to VBtn as-is, no mapping.
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  variant?: 'flat' | 'outlined' | 'tonal' | 'text' | 'plain'
  icon?: boolean
  rounded?: boolean
  disabled?: boolean
  loading?: boolean
  type?: string
  attributes?: Record<string, string> | null
  to?: RouteLocationRaw
  ripple?: boolean
  border?: boolean
  active?: boolean
  alignStart?: boolean
  dark?: boolean
  ariaLabel?: string
  ariaPressed?: boolean | 'mixed'
  ariaExpanded?: boolean | string
  ariaControls?: string
  appendIcon?: IconValue | undefined
  prependIcon?: IconValue | undefined
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  hoverColor?: string
}
