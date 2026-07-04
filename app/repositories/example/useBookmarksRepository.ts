import type { Bookmark } from '#shared/types/example/bookmarks'
import { queryOptions } from '@tanstack/vue-query'

/**
 * Репозиторій ресурсу "bookmarks" — читання + мутації.
 * Конвенція методів: `*Query()` → кешовані (queryOptions); дієслова (`create`) → мутації/сирі виклики.
 */
export function useBookmarksRepository() {
  return {
    /** Кешований список (queryOptions). SSR → useServerQuery, клієнт → useClientQuery. */
    listQuery: () =>
      queryOptions({
        queryKey: ['bookmarks'],
        queryFn: () => useApi<Bookmark[]>('/example/bookmarks'),
      }),
    /** Мутація (POST) → передається у mutationFn useApiMutation. */
    create: (body: { title: string }) =>
      useApi<Bookmark>('/example/bookmarks', { method: 'POST', body }),
  }
}
