// Source of truth for typography. Consumed by Tailwind and Vuetify.
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
