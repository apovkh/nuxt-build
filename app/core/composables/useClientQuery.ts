import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

// Клієнтський кеш. Для SPA-адмінки: без onServerPrefetch запит на сервері не виконується,
// а enabled на клієнті гарантує, що queryFn не смикнеться під час SSR.
export function useClientQuery<T>(options: UseQueryOptions<T>) {
  return useQuery({
    ...options,
    // якщо options.enabled — ref/getter, за потреби огорни його самостійно у проекті
    enabled: import.meta.client && ((options.enabled as boolean) ?? true),
  })
}
