import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2026-05-14',
  devtools: { enabled: import.meta.dev },
  sourcemap: {
    client: true,
    server: true,
  },

  srcDir: 'app/',
  dir: {
    public: 'public',
  },
  devServer: { port: 3001 },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/icon',
    '@pinia/nuxt',
    'vuetify-nuxt-module',
  ],

  components: {
    dirs: [
      '~/shared/ui',
      {
        path: '~/domains',
        pattern: '**/components/**',
        pathPrefix: false,
      },
      {
        path: '~/domains',
        pattern: '**/pages/**',
        pathPrefix: false,
      },
    ],
  },

  imports: {
    dirs: [
      'stores/**',
      'shared/composables',
      'shared/form',
      'shared/utils',
      'domains/*/composables',
      'domains/*/queries',
      'domains/*/stores',
    ],
    imports: [
      {
        as: 'useI18n',
        from: 'vue-i18n',
        name: 'useI18n',
      },
    ],
  },

  css: [
    '~/scss/vuetify-globals.scss',
    '~/scss/main.scss',
  ],

  runtimeConfig: {
    public: {
      // eslint-disable-next-line node/prefer-global/process
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },

  icon: {
    size: '1.25em',
    componentName: 'NuxtIcon',
    serverBundle: {
      collections: ['mdi'],
    },
  },

  vuetify: {
    moduleOptions: {
      disableVuetifyStyles: true,
      styles: {
        configFile: 'scss/vuetify-components.scss',
      },
    },
    vuetifyOptions: './vuetify.config.ts',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  app: {
    head: {
      titleTemplate: '%s · App',
      title: 'App',
      meta: [
        { name: 'description', content: '' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo.png' },
      ],
    },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  nitro: {
    routeRules: {
      '/_nuxt/**': {
        headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      },
      '/favicon.ico': {
        headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      },
      '/favicon.png': {
        headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      },
      '/logo.png': {
        headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      },
      '/robots.txt': {
        headers: { 'cache-control': 'public, max-age=86400' },
      },
    },
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  vite: {
    plugins: [
      VueI18nPlugin({
        include: [resolve(__dirname, './app/locales/**')],
        strictMessage: false,
      }),
    ],
  },

  alias: {
    '@mapping': resolve(__dirname, './app/shared/mapping'),
    '@schema': resolve(__dirname, './app/shared/types/schema.ts'),
    '#domains': resolve(__dirname, './app/domains'),
    '#shared': resolve(__dirname, './app/shared'),
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
