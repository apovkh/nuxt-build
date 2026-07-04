import type { Config } from 'tailwindcss'
import { colors } from './tokens/colors'
import { layout, typography } from './tokens/typography'

// Tailwind pulls values from tokens/* — the same source as the Vuetify theme.
export default <Partial<Config>>{
  theme: {
    extend: {
      colors: { ...colors },
      fontFamily: {
        sans: [typography.fontFamily.sans],
        heading: [typography.fontFamily.heading],
      },
      fontSize: typography.fontSize,
      borderRadius: {
        DEFAULT: layout.radius,
      },
    },
  },
}
