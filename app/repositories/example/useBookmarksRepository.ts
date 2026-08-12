import type { Bookmark } from '#shared/types/example/bookmarks'
import { queryOptions } from '@tanstack/vue-query'

/**
 * Repository for the "bookmarks" resource — reads + mutations.
 * Method convention: `*Query()` → cached (queryOptions); verbs (`create`) → mutations/raw calls.
 */
export function useBookmarksRepository() {
  return {
    /** Cached list (queryOptions). SSR → useServerQuery, client → useClientQuery. */
    listQuery: () =>
      queryOptions({
        queryKey: ['bookmarks'],
        queryFn: () => useApi<Bookmark[]>('/example/bookmarks'),
      }),
    /** Mutation (POST) → passed as the mutationFn of useApiMutation. */
    create: (body: { title: string }) =>
      useApi<Bookmark>('/example/bookmarks', { method: 'POST', body }),
  }
}
