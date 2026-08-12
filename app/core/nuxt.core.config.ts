import type { NuxtConfig } from 'nuxt/schema'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

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
    '~/core/plugins/vuetify',
  ],
  // Vuetify styles BEFORE main.css: vite-plugin-vuetify resolves only the components,
  // not their CSS. Order matters — Tailwind utilities must override Vuetify's base
  // styles, not the other way around.
  css: ['vuetify/styles', '~/core/tokens/main.css'],
  tailwindcss: { configPath: '~/core/tailwind.config' },

  // Vuetify ships untranspiled ESM — Nitro must compile it for the SSR bundle.
  build: { transpile: ['vuetify'] },

  // vite-plugin-vuetify resolves components (VBtn, VDataTable, VDialog…) on the fly,
  // so SFCs don't import them — and only what's actually used ends up in the bundle.
  // Nuxt doesn't let us pass the plugin via vite.plugins (the config gets serialized),
  // so we hook into vite:extendConfig instead.
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // config.plugins is typed readonly, even though this is exactly where Nuxt expects mutation.
        const mutableConfig = config as { plugins?: unknown[] }
        mutableConfig.plugins ??= []
        mutableConfig.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],

  vite: {
    vue: { template: { transformAssetUrls } },
  },
}
