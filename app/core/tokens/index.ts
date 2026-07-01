import { colors, darkColors } from './colors'
import { typography, layout } from './typography'

export * from './colors'
export * from './typography'

// Агрегат усіх токенів ядра.
export const coreTokens = { colors, darkColors, typography, layout } as const

// ── Підключення до Vuetify (у проекті, коли додаси Vuetify) ─────────────────
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
// Ті самі colors живлять Tailwind (див. tailwind.config.ts) → одне джерело для обох.
