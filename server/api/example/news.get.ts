import type { Article } from '#shared/types/example/news'

// Тонкий роут: читає приватний ключ і делегує серверному репозиторію (server/repositories).
export default defineEventHandler(async (event): Promise<Article[]> => {
  const { newsApiKey } = useRuntimeConfig(event)

  if (!newsApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'NEWS_API_KEY is not configured' })
  }

  try {
    return await newsRepository.fetchLatest(newsApiKey)
  }
  catch (err) {
    // Зовнішній newsdata.io впав (500/таймаут тощо) — не пропускаємо «голий» апстрім-стек
    // у клієнт. Логуємо деталі на сервері й віддаємо чистий 502, який клієнтський
    // normalizeApiError покаже осмисленим message (error-UI сторінок новин).
    console.error('[news] upstream newsdata.io failed:', (err as Error)?.message)
    const message = 'Сервіс новин тимчасово недоступний. Спробуйте пізніше.'
    throw createError({ statusCode: 502, message, data: { message } })
  }
})
