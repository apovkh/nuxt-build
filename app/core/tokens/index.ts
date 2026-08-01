import { colors, darkColors } from './colors'
import { layout, typography } from './typography'

export * from './colors'
export * from './typography'

// Aggregate of all core tokens.
export const coreTokens = { colors, darkColors, typography, layout } as const

// These colors are wired into Vuetify's theme in ~/core/plugins/vuetify.ts and into
// Tailwind in ./tailwind.config.ts → one source for both.
