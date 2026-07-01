// HTTP-клієнт ядра з інтерсепторами. Доступний усюди як useNuxtApp().$api
// baseURL береться з runtimeConfig.public.apiBase (задається у проекті через .env).
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    timeout: coreConfig.http.timeout,
    retry: coreConfig.http.retry,
    retryDelay: coreConfig.http.retryDelay,

    onRequest({ options }) {
      const token = useCookie('token').value
      if (token) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    },

    onResponseError({ response }) {
      // Централізована обробка помилок. 401 → на логін (тільки на клієнті).
      if (response.status === 401 && import.meta.client) {
        navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})
