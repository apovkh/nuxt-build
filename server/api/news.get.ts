import type { Article } from '#shared/types/news'

// Тонкий роут: читає приватний ключ і делегує серверному репозиторію (server/repositories).
export default defineEventHandler(async (event): Promise<Article[]> => {
  const { newsApiKey } = useRuntimeConfig(event)

  if (!newsApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'NEWS_API_KEY is not configured' })
  }

  return newsRepository.fetchLatest(newsApiKey)
})
