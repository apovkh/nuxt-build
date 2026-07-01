import { handleGlobalApiError } from '~/core/utils/handleApiError'

// ⚠️ JUST a request — no cache, no TanStack, no SSR payload.
// A thin wrapper over the core transport ($http) for one-off calls by URL.
// Errors are routed to the global handler and re-thrown (for local handling).
export async function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  const { $http } = useNuxtApp()
  try {
    return await $http<T>(url, opts)
  } catch (err) {
    handleGlobalApiError(err)
    throw err
  }
}
