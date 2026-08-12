import type { Article } from '#shared/types/example/news'
import { queryOptions } from '@tanstack/vue-query'

/**
 * Repository for the "news" resource — the single access point to news data.
 * Method convention: `*Query()` → cached (queryOptions, TanStack); plain verbs
 * (`getAll`) → raw/one-off calls. SSR vs client is decided by the page via a composable.
 */
export function useNewsRepository() {
  const getAll = () => useApi<Article[]>('/example/news')

  return {
    /** Static / one-off read without cache → useApi or a direct await. */
    getAll,
    /** Cached read (queryOptions). SSR → useServerQuery, client → useClientQuery. */
    listQuery: () => queryOptions({ queryKey: ['news'], queryFn: getAll }),
  }
}
