import type { Config } from 'tailwindcss'
import { colors } from './tokens/colors'
import { layout, typography } from './tokens/typography'

// hex #rrggbb → 'r,g,b' — to build rgba() with a different alpha per shadow step
// from a single color token (shadows need rgba, the token is hex).
function channels(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16)

  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}
// Shadow ink is brand-secondary. A shadow stays dark in both themes, so we take
// the fixed brand color rather than a semantic token that flips.
const shadowInk = channels(colors['brand-secondary'])

// Each token is exposed as a reference to the Vuetify theme's CSS variable, not as hex.
// Vuetify prints them as "R,G,B" triplets on .v-theme--light / .v-theme--dark, so
// one and the same class (bg-surface, text-primary) switches together with the
// theme. With hex values the Tailwind utilities would be static and in the dark
// theme would give, say, dark text on a dark background.
// <alpha-value> keeps the opacity modifiers: bg-brand-primary/10 works as usual.
// Specifically rgba(..., a), NOT rgb(... / a): Vuetify prints the channels comma-separated
// ("2,48,71"), while the slash syntax requires spaces — rgb(2,48,71/1) doesn't parse
// at all, and the color silently falls back to inherit (black).
const themeColors = Object.fromEntries(
  Object.keys(colors).map(key => [key, `rgba(var(--v-theme-${key}), <alpha-value>)`]),
) as Record<keyof typeof colors, string>

// Tailwind pulls values from tokens/* — the same source as the Vuetify theme.
export default <Partial<Config>>{
  theme: {
    extend: {
      colors: themeColors,
      fontFamily: {
        sans: [typography.fontFamily.sans],
        heading: [typography.fontFamily.heading],
      },
      fontSize: typography.fontSize,
      borderRadius: {
        DEFAULT: layout.radius,
      },
      // Shadow scale: one ink color (brand-secondary from the token) on every step,
      // blur+intensity growing sm→xl,
      // so the shadows read as a single system. sm — outline, md — card (at rest),
      // lg — lift/hover, xl — overlays (toaster, popovers, modals).
      boxShadow: {
        sm: `0 1px 2px rgba(${shadowInk},0.05)`,
        md: `0 1px 2px rgba(${shadowInk},0.05), 0 10px 30px -18px rgba(${shadowInk},0.16)`,
        lg: `0 1px 2px rgba(${shadowInk},0.05), 0 16px 40px -22px rgba(${shadowInk},0.22)`,
        xl: `0 2px 4px rgba(${shadowInk},0.06), 0 28px 56px -24px rgba(${shadowInk},0.28)`,
      },
    },
  },
}
