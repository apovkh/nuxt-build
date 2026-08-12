import type { Article } from '#shared/types/example/news'

// Thin route: reads the private key and delegates to the server repository (server/repositories).
export default defineEventHandler(async (event): Promise<Article[]> => {
  const { newsApiKey } = useRuntimeConfig(event)

  if (!newsApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'NEWS_API_KEY is not configured' })
  }

  try {
    return await newsRepository.fetchLatest(newsApiKey)
  }
  catch (err) {
    // External newsdata.io failed (500/timeout etc.) — don't leak the raw upstream stack
    // to the client. Log the details on the server and return a clean 502, which the client-side
    // normalizeApiError renders as a meaningful message (error UI of the news pages).
    console.error('[news] upstream newsdata.io failed:', (err as Error)?.message)
    const message = 'The news service is temporarily unavailable. Please try again later.'
    throw createError({ statusCode: 502, message, data: { message } })
  }
})
