// Source of truth for typography — consumed by Tailwind, Vuetify and the
// UI-kit (UiText/UIBtn/...). Two layers coexist here on purpose:
//
//  1. Granular DS scale (UPPER_CASE: FONT_FAMILY/FONT_SIZE/... + TITLE) — the
//     t-shirt scale the UI-kit components index off their `size`/`level` props.
//  2. Aggregate objects (`typography`, `layout`) — the flat maps Tailwind and
//     the Vuetify theme read. NOTE: their fontSize scale (base=16px) is the
//     scale the whole existing app is built on — do NOT fold it into the DS
//     scale (base=14px) or every page's type shifts.

// ── Granular DS tokens ──────────────────────────────────────────────────────
// display = Montserrat (headings/accents, self-hosted). sans = Inter (UI/body)
// — Inter is NOT self-hosted yet, so it currently falls back to system-ui.
// Numerals: tabular-nums (no separate mono web font is loaded).
// Icons: mdi icon font (@mdi/font via vuetify-nuxt-module).
export const FONT_FAMILY = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
} as const

/** Named font faces (keys of FONT_FAMILY). */
export type FontFamily = keyof typeof FONT_FAMILY

// Type scale — [font-size, { lineHeight }]. Tailwind-compatible tuples.
export const FONT_SIZE = {
  'xs': ['12px', { lineHeight: '16px' }],
  'sm': ['13px', { lineHeight: '18px' }],
  'base': ['14px', { lineHeight: '20px' }],
  'md': ['15px', { lineHeight: '22px' }],
  'lg': ['16px', { lineHeight: '24px' }],
  'xl': ['18px', { lineHeight: '26px' }],
  '2xl': ['22px', { lineHeight: '28px' }],
  '3xl': ['28px', { lineHeight: '34px' }],
  '4xl': ['34px', { lineHeight: '40px' }],
} as const

/** Named steps of the type scale (keys of FONT_SIZE). */
export type FontSize = keyof typeof FONT_SIZE

export const FONT_WEIGHT = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

/** Named font-weight steps. */
export type FontWeight = keyof typeof FONT_WEIGHT

export const LETTER_SPACING = {
  tight: '-0.01em',
  normal: '0',
  wide: '0.02em',
} as const

/** Named letter-spacing steps (keys of LETTER_SPACING). */
export type LetterSpacing = keyof typeof LETTER_SPACING

/** Title/heading levels — h1…h6. */
export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6

// Title presets — each level pairs a type-scale step with a weight, face and
// tracking so headings stay consistent wherever they appear. Built from the
// other type tokens (not raw literals); consumed by UiText's `level` prop.
export const TITLE: Record<TitleLevel, {
  size: FontSize
  weight: FontWeight
  family: FontFamily
  tracking: LetterSpacing
}> = {
  1: { size: '4xl', weight: 'bold', family: 'display', tracking: 'tight' },
  2: { size: '3xl', weight: 'bold', family: 'display', tracking: 'tight' },
  3: { size: '2xl', weight: 'semibold', family: 'display', tracking: 'tight' },
  4: { size: 'xl', weight: 'semibold', family: 'display', tracking: 'normal' },
  5: { size: 'lg', weight: 'semibold', family: 'sans', tracking: 'normal' },
  6: { size: 'md', weight: 'semibold', family: 'sans', tracking: 'normal' },
}

export const TYPOGRAPHY = { fontFamily: FONT_FAMILY, fontSize: FONT_SIZE, fontWeight: FONT_WEIGHT, letterSpacing: LETTER_SPACING, title: TITLE } as const
export type Typography = typeof TYPOGRAPHY

// ── Aggregate maps for Tailwind / Vuetify (existing app scale) ───────────────
// Kept flat and Montserrat-only to match what the current UI is built on.
export const typography = {
  fontFamily: {
    sans: '\'Montserrat\', system-ui, sans-serif',
    heading: '\'Montserrat\', system-ui, sans-serif',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '22px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
} as const

// Geometry (radii, etc.) — kept here so it's a single source too.
export const layout = {
  radius: '8px',
} as const
