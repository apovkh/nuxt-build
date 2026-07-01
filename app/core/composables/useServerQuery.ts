import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

// SSR + cache. For routes with ssr: true, where data must already be in the HTML.
// onServerPrefetch + suspense() force the query to finish on the server → it lands in dehydrate.
export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
