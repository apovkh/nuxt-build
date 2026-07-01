import type { NuxtConfig } from 'nuxt/schema'

// Nuxt-налаштування ядра (білд-рівень). Підключається у кореневому nuxt.config через defu.
// Шляхи imports.dirs — відносно srcDir (app/). `~` теж вказує на app/.
export const coreNuxtConfig: NuxtConfig = {
  imports: {
    dirs: ['core/composables', 'core/composables/**', 'core/utils'],
  },
  components: [
    { path: '~/core/components', pathPrefix: false },
  ],
  plugins: [
    '~/core/plugins/api',
    '~/core/plugins/vue-query',
  ],
  css: ['~/core/tokens/main.css'],
  // @ts-expect-error опція надається модулем @nuxtjs/tailwindcss
  tailwindcss: { configPath: '~/core/tailwind.config' },
}
