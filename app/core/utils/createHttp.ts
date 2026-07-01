import type { $Fetch } from 'ofetch'

// Transport factory: a $fetch instance with interceptors.
// Used by both the core ($http) and the project SDK ($api) — one set of interceptors for all.
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
