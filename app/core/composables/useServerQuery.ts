import type { UseQueryOptions } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

// SSR + cache. For routes with ssr: true, where data must already be in the HTML.
// The query resolves BEFORE render on both the initial document (server) and in-app
// navigation (client), so there's no `Loading…` flash either way — await it in setup.
export async function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)

  if (import.meta.server) {
    // SSR: finish on the server → data lands in dehydrate/HTML (SEO). Registered
    // synchronously (before any await), so server behaviour is unchanged.
    onServerPrefetch(() => query.suspense().catch(() => {}))
  }
  else {
    // Client-side navigation: await so Nuxt's page <Suspense> holds the transition
    // until data is ready (like useFetch) instead of flashing Loading. After hydration
    // (hard load) the cache is warm → suspense resolves instantly, no extra request.
    await query.suspense().catch(() => {})
  }

  return query
}
