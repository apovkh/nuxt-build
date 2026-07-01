import type { Article, NewsResponse } from '#shared/types/news'

export default defineEventHandler(async (event): Promise<Article[]> => {
  const { newsApiKey } = useRuntimeConfig(event)

  if (!newsApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'NEWS_API_KEY is not configured' })
  }

  const res = await $fetch<Partial<NewsResponse>>(
    'https://newsdata.io/api/1/latest',
    {
      query: {
        apikey: newsApiKey,
        country: 'ua',
        language: 'en',
        category: 'business,environment,lifestyle,sports,technology',
        image: 1,
      },
    },
  )

  return res.results ?? []
})
