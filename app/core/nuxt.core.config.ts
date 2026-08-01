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
  // Стилі Vuetify — ПЕРЕД main.css: vite-plugin-vuetify резолвить лише компоненти,
  // не їхній CSS. Порядок важливий — Tailwind-утиліти мають перебивати базові
  // стилі Vuetify, а не навпаки.
  css: ['vuetify/styles', '~/core/tokens/main.css'],
  tailwindcss: { configPath: '~/core/tailwind.config' },

  // Vuetify ships untranspiled ESM — Nitro must compile it for the SSR bundle.
  build: { transpile: ['vuetify'] },

  // vite-plugin-vuetify резолвить компоненти (VBtn, VDataTable, VDialog…) на льоту,
  // тож у SFC їх не імпортують — і в бандл потрапляє лише те, що реально вжите.
  // Nuxt не дає передати плагін через vite.plugins (конфіг серіалізується),
  // тому чіпляємось до vite:extendConfig.
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // config.plugins типізований readonly, хоча Nuxt саме тут і очікує мутацію.
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
