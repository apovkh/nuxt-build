// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defu } from 'defu'
import { coreNuxtConfig } from './app/core/nuxt.core.config'

// Проектні налаштування мержаться з ядром (coreNuxtConfig) через defu:
// defu глибоко об'єднує обʼєкти й КОНКАТЕНУЄ масиви (css/plugins/imports/components),
// тож ядрові плагіни ($api, vue-query), auto-import composables та tokens/tailwind
// підключаються разом із проектними значеннями. База — другим аргументом.
// Preload найкритичнішого шрифту (upright Montserrat) → менше FOUT: браузер тягне
// .woff2 одразу з <head>, паралельно з CSS. Guarded: <link> додається, ЛИШЕ коли файл
// реально існує в /public/fonts — інакше був би 404 + "preloaded but not used".
// Публічний (нехешований) шлях і робить статичний preload можливим — з бандла ні.
const CRITICAL_FONT = 'Montserrat-Variable.woff2'
const fontPreload = existsSync(fileURLToPath(new URL(`./public/fonts/${CRITICAL_FONT}`, import.meta.url)))
  ? [{ rel: 'preload', as: 'font', type: 'font/woff2', href: `/fonts/${CRITICAL_FONT}`, crossorigin: 'anonymous' }]
  : []

export default defineNuxtConfig(
  defu(
    {
      compatibilityDate: '2025-07-15',
      devtools: { enabled: true },
      ssr: true,

      // Preload критичного шрифту з <head> (fontPreload вище). Ядро не задає app, тож
      // defu просто додає це; коли шрифт відсутній — масив порожній, нічого не рендериться.
      app: { head: { link: [...fontPreload] } },

      // Інлайнити CSS у HTML (замість окремого <link>). Проектний CSS крихітний
      // (~3 KB gzip), тож економимо render-blocking round-trip на першому показі, а
      // втрата крос-сторінкового кешу мізерна. У dev Nuxt однаково інлайн вимикає.
      features: { inlineStyles: true },

      modules: ['@nuxt/image', '@nuxtjs/tailwindcss', '@nuxt/eslint'],

      // ESLint: antfu-пресет несе власні інстанси плагінів — standalone: false
      // прибирає дублікати з nuxt-конфіга (інакше конфлікт plugin "import").
      eslint: { config: { standalone: false } },

      // Проектна папка компонентів. Ядро задає свою ~/core/components і цим заміщує дефолт,
      // тож ~/components повертаємо тут; defu сконкатенує обидві.
      components: ['~/components'],

      // Проектні data-access репозиторії. Шлях відносно srcDir (app/) → app/repositories.
      // '**' підхоплює вкладену repositories/example (демо-репозиторії). composables/example —
      // showcase-composable usePageCode (дефолтний auto-import сканує лише верхній рівень).
      // defu конкатенує з ядровими imports.dirs, тож use*Repository auto-import'яться.
      imports: { dirs: ['repositories', 'repositories/**', 'composables/example'] },

      // Серверний data-access шар. Nitro автоімпортує лише server/utils за замовчуванням,
      // тож server/repositories реєструємо явно → newsRepository/bookmarksRepository у роутах.
      // '**' підхоплює вкладену server/repositories/example (демо).
      nitro: { imports: { dirs: ['server/repositories', 'server/repositories/**'] } },

      runtimeConfig: {
        // Приватний ключ, лише на сервері. Overridable через NUXT_NEWS_API_KEY.
        newsApiKey: process.env.NEWS_API_KEY,
        public: {
          // baseURL для $api (core/plugins/api.ts). '/api' → useApi('/example/news') б'є у /api/example/news.
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
