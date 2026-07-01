// Джерело правди для типографіки. Споживається Tailwind і Vuetify.
export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, sans-serif",
    heading: "'Inter', system-ui, sans-serif",
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

// Геометрія (радіуси тощо) — тримаємо тут, щоб теж було одним джерелом.
export const layout = {
  radius: '8px',
} as const
