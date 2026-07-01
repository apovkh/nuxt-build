import { queryOptions } from '@tanstack/vue-query'
import type { Article } from '#shared/types/news'

/**
 * Репозиторій ресурсу "news" — єдина точка доступу до даних новин.
 * Конвенція методів: `*Query()` → кешовані (queryOptions, TanStack); прості дієслова
 * (`getAll`) → сирі/разові виклики. SSR vs клієнт вирішує сторінка композаблом.
 */
export function useNewsRepository() {
  const getAll = () => useApi<Article[]>('/news')

  return {
    /** Статичний / разовий read без кешу → useApi або прямий await. */
    getAll,
    /** Кешований read (queryOptions). SSR → useServerQuery, клієнт → useClientQuery. */
    listQuery: () => queryOptions({ queryKey: ['news'], queryFn: getAll }),
  }
}
