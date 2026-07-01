import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

// SSR + кеш. Для маршрутів з ssr: true, де дані мають прийти вже в HTML.
// onServerPrefetch + suspense() змушують запит завершитись на сервері → потрапляє у dehydrate.
export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
