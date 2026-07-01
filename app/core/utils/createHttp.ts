import type { $Fetch } from 'ofetch'

// Фабрика транспорту: $fetch-інстанс з інтерсепторами.
// Використовується і ядром ($http), і проектним SDK ($api) — один набір інтерсепторів на всіх.
export function createHttp(): $Fetch {
  const config = useRuntimeConfig()

  return $fetch.create({
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
      if (response.status === 401 && import.meta.client) {
        navigateTo('/login')
      }
    },
  })
}
