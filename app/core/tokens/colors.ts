// Source of truth for colors. Consumed by Tailwind and the Vuetify theme from one place.
// Keys align with Vuetify theme.colors (primary/secondary/surface/background/error/info/
// success/warning), so they plug in directly without mapping.
export const colors = {
  primary: '#2563eb',
  secondary: '#64748b',
  surface: '#ffffff',
  background: '#f8fafc',
  error: '#dc2626',
  info: '#0ea5e9',
  success: '#16a34a',
  warning: '#f59e0b',
  // extra (outside the Vuetify standard)
  muted: '#f1f5f9',
  border: '#e2e8f0',
} as const

export const darkColors = {
  ...colors,
  surface: '#0f172a',
  background: '#020617',
  muted: '#1e293b',
  border: '#334155',
} as const

export type ColorToken = keyof typeof colors
