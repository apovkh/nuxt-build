// https://nuxt.com/docs/api/configuration/nuxt-config
import { defu } from 'defu'
import { coreNuxtConfig } from './app/core/nuxt.core.config'

// Проектні налаштування мержаться з ядром (coreNuxtConfig) через defu:
// defu глибоко об'єднує обʼєкти й КОНКАТЕНУЄ масиви (css/plugins/imports/components),
// тож ядрові плагіни ($api, vue-query), auto-import composables та tokens/tailwind
// підключаються разом із проектними значеннями. База — другим аргументом.
export default defineNuxtConfig(
  defu(
    {
      compatibilityDate: '2025-07-15',
      devtools: { enabled: true },
      ssr: true,

      modules: ['@nuxt/image', '@nuxtjs/tailwindcss'],

      // Проектна папка компонентів. Ядро задає свою ~/core/components і цим заміщує дефолт,
      // тож ~/components повертаємо тут; defu сконкатенує обидві.
      components: ['~/components'],

      // Проектні data-access репозиторії. Шлях відносно srcDir (app/) → app/repositories.
      // defu конкатенує з ядровими imports.dirs, тож use*Repository auto-import'яться.
      imports: { dirs: ['repositories'] },

      // Серверний data-access шар. Nitro автоімпортує лише server/utils за замовчуванням,
      // тож server/repositories реєструємо явно → newsRepository/bookmarksRepository у роутах.
      nitro: { imports: { dirs: ['server/repositories'] } },

      runtimeConfig: {
        // Приватний ключ, лише на сервері. Overridable через NUXT_NEWS_API_KEY.
        newsApiKey: process.env.NEWS_API_KEY,
        public: {
          // baseURL для $api (core/plugins/api.ts). '/api' → useApi('/news') б'є у /api/news.
          apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
        },
      },

      routeRules: {
        // Приклад SPA-маршруту: рендериться лише на клієнті (демо useClientQuery).
        '/example-news-spa': { ssr: false },
      },
    },
    coreNuxtConfig,
  ),
)
