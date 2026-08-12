// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defu } from 'defu'
import { coreNuxtConfig } from './app/core/nuxt.core.config'

// Project settings merge with the core (coreNuxtConfig) via defu:
// defu deep-merges objects and CONCATENATES arrays (css/plugins/imports/components),
// so the core plugins ($api, vue-query, vuetify), auto-import composables and tokens/tailwind
// are wired up together with the project values. The base goes as the second argument.
// Preload the most critical font (upright Montserrat) → less FOUT: the browser fetches
// the .woff2 right from <head>, in parallel with CSS. Guarded: the <link> is added ONLY when
// the file actually exists in /public/fonts — otherwise it'd be a 404 + "preloaded but not used".
// The public (unhashed) path is what makes a static preload possible — a bundled one can't.
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

      // Preload the critical font from <head> (fontPreload above). The core doesn't set app,
      // so defu simply adds this; when the font is missing the array is empty and nothing renders.
      app: { head: { link: [...fontPreload] } },

      // Inline CSS into the HTML (instead of a separate <link>). The project CSS is tiny
      // (~3 KB gzip), so we save a render-blocking round-trip on first paint, while the
      // loss of cross-page caching is negligible. In dev Nuxt disables inlining anyway.
      features: { inlineStyles: true },

      modules: ['@nuxt/image', '@nuxtjs/tailwindcss', '@nuxt/eslint'],

      // ESLint: the antfu preset ships its own plugin instances — standalone: false
      // removes the duplicates from the nuxt config (otherwise plugin "import" conflicts).
      eslint: { config: { standalone: false } },

      // Project components folder. The core sets its own ~/core/components, which replaces
      // the default, so ~/components is re-added here; defu concatenates both.
      components: ['~/components'],

      // Project data-access repositories. Path is relative to srcDir (app/) → app/repositories.
      // '**' picks up the nested repositories/example (demo repositories). composables/example —
      // the showcase composable usePageCode (the default auto-import scans only the top level).
      // defu concatenates with the core imports.dirs, so use*Repository get auto-imported.
      imports: { dirs: ['repositories', 'repositories/**', 'composables/example'] },

      // Server data-access layer. Nitro auto-imports only server/utils by default,
      // so server/repositories is registered explicitly → newsRepository/bookmarksRepository in routes.
      // '**' picks up the nested server/repositories/example (demo).
      nitro: { imports: { dirs: ['server/repositories', 'server/repositories/**'] } },

      runtimeConfig: {
        // Private key, server-only. Overridable via NUXT_NEWS_API_KEY.
        newsApiKey: process.env.NEWS_API_KEY,
        public: {
          // baseURL for $api (core/plugins/api.ts). '/api' → useApi('/example/news') hits /api/example/news.
          apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
        },
      },

      routeRules: {
        // Example SPA route: rendered on the client only (useClientQuery demo).
        '/example-news-spa': { ssr: false },
      },
    },
    coreNuxtConfig,
  ),
)
