import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { colors, darkColors } from '~/core/tokens'

// Vuetify init. The theme palette comes straight from ~/core/tokens/colors — the same
// source Tailwind reads (see tailwind.config.ts), so there is one place to change a colour.
//
// Icons: the kit passes raw SVG path strings from @mdi/js (`:icon="mdiChevronDown"`),
// so the set must be `mdi-svg`. The default font-based `mdi` set would render those
// paths as literal text.
// `aliases` is not optional: Vuetify's internal icons ($checkboxOff, $dropdown, $clear…)
// are alias names, and without the mdi-svg alias map they land in <path d="…"> verbatim
// — checkboxes and dropdown arrows silently render as nothing.
export default defineNuxtPlugin((nuxt) => {
  const vuetify = createVuetify({
    ssr: true,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: { dark: false, colors },
        dark: { dark: true, colors: darkColors },
      },
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
  })

  nuxt.vueApp.use(vuetify)
})
