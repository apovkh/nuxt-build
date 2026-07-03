import type { Article, NewsResponse } from '#shared/types/news'

// Серверний data-access ресурсу "news": інкапсулює виклик зовнішнього API newsdata.io
// та секретний ключ. Лише сервер — у клієнт не потрапляє. Використовується Nitro-роутами.
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
