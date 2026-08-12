import type { Article, NewsResponse } from '#shared/types/example/news'

// Server-side data access for the "news" resource: encapsulates the call to the external
// newsdata.io API and the secret key. Server only — never shipped to the client. Used by Nitro routes.
export const newsRepository = {
  async fetchLatest(apiKey: string): Promise<Article[]> {
    const res = await $fetch<Partial<NewsResponse>>(
      'https://newsdata.io/api/1/latest',
      {
        query: {
          apikey: apiKey,
          country: 'ua',
          language: 'en',
          category: 'business,environment,lifestyle,sports,technology',
          image: 1,
        },
      },
    )

    return res.results ?? []
  },
}
