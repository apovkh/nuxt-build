import type { ExternalVuetifyOptions } from 'vuetify-nuxt-module'
import { en } from 'vuetify/locale'

export default {
  date: {
    adapter: 'vuetify',
  },
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: {
      en,
    },
  },
  icons: {
    defaultSet: 'mdi-svg',
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      md: 767.98,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          'border': '#D5D7DA',
          'gray': '#344054',
          'font1': '#1D2939',
          'font2': '#475467',
          'font3': '#98A2B3',
          'primary': '#1570EF',
          'secondary': '#22262F',
          'error': '#D92D20',
          'success': '#079455',
          'warning': '#DC6803',
          'on-success': '#ffffff',
        },
      },
    },
  },
} satisfies ExternalVuetifyOptions
