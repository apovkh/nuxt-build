import type { Config } from 'tailwindcss'
import { colors } from './tokens/colors'
import { typography, layout } from './tokens/typography'

// Tailwind тягне значення з tokens/* — те саме джерело, що й Vuetify-тема.
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
