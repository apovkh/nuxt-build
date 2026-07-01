// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,

  runtimeConfig: {
    // Private key, only available server-side. Overridable via NUXT_NEWS_API_KEY.
    newsApiKey: process.env.NEWS_API_KEY,
  },

  modules: ['@nuxt/image'],
})