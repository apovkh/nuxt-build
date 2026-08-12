// Source of truth for color — read by the Vuetify theme (~/core/plugins/vuetify.ts)
// and by Tailwind (./tailwind.config.ts), so one edit here moves both.
//
// Tokens are split into groups:
//   base    — white/black: absolute values, identical in any theme
//   brand   — brand-*: fixed identity, also does NOT switch in dark
//   status  — error/info/success/warning: state semantics (Vuetify reads these
//             names itself — validation, alerts)
//   text    — primary/secondary: ink on top of surfaces, switches in dark
//   surface — surfaces and lines, switches in dark
//
// The "text" group deliberately has NO prefix in its keys: the utility already
// carries it, so the class reads as `text-primary`, not `text-text-primary`. Because of this:
//   • the ACTION color (buttons, links, input focus) is `brand-primary`, not `primary`;
//     kit components pass color="brand-primary" explicitly;
//   • `primary`/`secondary` in the Vuetify theme mean TEXT, not accent —
//     unlike Vuetify's default convention.

// ── Base ────────────────────────────────────────────────────────────────────
export const BASE_COLORS = {
  white: '#ffffff',
  black: '#000000',
} as const

// ── Brand ───────────────────────────────────────────────────────────────────
// Fixed identity: unlike the tokens below, these do NOT switch between
// themes — brand-secondary stays dark in the dark theme too. There are deliberately
// no neutrals here: canvas/border/muted live in the surface group, and a second set
// would only drift out of sync with the theme.
//
// The primary ramp is defined once; `brand-primary` (step 600) and
// `brand-secondary` (step 900) are aliases into it, not second copies of the
// same hex. That's why there is no separate `brand-primary-600`: it IS `brand-primary`.
const BRAND_PRIMARY_RAMP = {
  50: '#e3f1f7',
  100: '#c2e2ee',
  200: '#8ecae6', // soft background / illustrations
  400: '#4fb3d1',
  600: '#219ebc',
  900: '#023047',
} as const

export const BRAND_COLORS = {
  'brand-primary': BRAND_PRIMARY_RAMP[600], // action: buttons, links, focus
  'brand-primary-50': BRAND_PRIMARY_RAMP[50],
  'brand-primary-100': BRAND_PRIMARY_RAMP[100],
  'brand-primary-200': BRAND_PRIMARY_RAMP[200],
  'brand-primary-400': BRAND_PRIMARY_RAMP[400],
  'brand-primary-900': BRAND_PRIMARY_RAMP[900],
  'brand-secondary': BRAND_PRIMARY_RAMP[900], // ink / dark surfaces
  'brand-accent': '#ffb703', // attention — status warning derives from it
  'brand-accent-600': '#fb8500', // darker accent step — CTA
} as const

// ── Status (semantics) ──────────────────────────────────────────────────────
// The names are fixed by Vuetify: validation messages, VAlert and the like take
// exactly `error`/`success`/`warning`/`info`, so they can't be renamed.
export const STATUS_COLORS = {
  error: '#dc2626',
  info: '#0ea5e9',
  success: '#1a9e56',
  warning: BRAND_COLORS['brand-accent'],
} as const

// ── Text ────────────────────────────────────────────────────────────────────
// Classes: text-primary / text-secondary. They also work in the color prop of
// Vuetify components (color="secondary"), since the key has no prefix of its own.
export const TEXT_COLORS = {
  primary: BRAND_COLORS['brand-secondary'], // headings, body text
  secondary: '#55707f', // captions, hints, secondary text
} as const

// ── Surface ─────────────────────────────────────────────────────────────────
export const SURFACE_COLORS = {
  surface: BASE_COLORS.white, // cards, popovers
  background: '#f4f8fb', // page canvas
  muted: '#eef4f7', // muted fill
  border: '#e4eef3', // lines, dividers
  highlight: BRAND_COLORS['brand-primary-50'], // selected/active row
} as const

export const colors = {
  ...BASE_COLORS,
  ...BRAND_COLORS,
  ...STATUS_COLORS,
  ...TEXT_COLORS,
  ...SURFACE_COLORS,
} as const

// The dark theme overrides only text and surfaces — base and brand stay as they are.
// Everything read through Tailwind utilities takes its value from --v-theme-* (see
// tailwind.config.ts), so the keys overridden here automatically "flip"
// in @apply classes too.
export const darkColors = {
  ...colors,
  primary: '#e8f3f8',
  secondary: '#9fc0d0',
  surface: '#0a3a54',
  background: '#023047',
  muted: '#0f4a68',
  border: '#12506f',
  highlight: '#0f4a68',
} as const

export type ColorToken = keyof typeof colors
