import type { UseQueryOptions } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'

// Client-side cache. For an SPA admin panel: without onServerPrefetch the query doesn't run on the server,
// and enabling it only on the client guarantees queryFn won't fire during SSR.
export function useClientQuery<T>(options: UseQueryOptions<T>) {
  return useQuery({
    ...options,
    // if options.enabled is a ref/getter, wrap it yourself in the project as needed
    enabled: import.meta.client && ((options.enabled as boolean) ?? true),
  })
}
