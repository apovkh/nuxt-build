import { colors, darkColors } from './colors'
import { layout, typography } from './typography'

export * from './colors'
export * from './typography'

// Aggregate of all core tokens.
export const coreTokens = { colors, darkColors, typography, layout } as const

// ── Wiring into Vuetify (in the project, once you add Vuetify) ──────────────
//
// import { createVuetify } from 'vuetify'
// import { colors, darkColors } from '~/core/tokens'
//
// export default createVuetify({
//   theme: {
//     defaultTheme: 'light',
//     themes: {
//       light: { colors },
//       dark:  { dark: true, colors: darkColors },
//     },
//   },
// })
//
// The same colors power Tailwind (see tailwind.config.ts) → one source for both.
