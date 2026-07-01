import type { NuxtConfig } from 'nuxt/schema'

// Core Nuxt settings (build level). Wired into the root nuxt.config via defu.
// imports.dirs paths are relative to srcDir (app/). `~` also points to app/.
export const coreNuxtConfig: NuxtConfig = {
  imports: {
    dirs: ['core/composables', 'core/composables/**', 'core/utils'],
  },
  // Core folder only. NOTE: setting the components array replaces the default, so the
  // project's ~/components must be re-added in the root nuxt.config (defu concatenates both).
  components: [
    { path: '~/core/components', pathPrefix: false },
  ],
  plugins: [
    '~/core/plugins/api',
    '~/core/plugins/vue-query',
  ],
  css: ['~/core/tokens/main.css'],
  // @ts-expect-error option provided by the @nuxtjs/tailwindcss module
  tailwindcss: { configPath: '~/core/tailwind.config' },
}
