/**
 * A single article as returned by the newsdata.io `/latest` endpoint.
 *
 * Some fields are gated behind paid plans. On the free plan they come back as
 * placeholder strings (e.g. "ONLY AVAILABLE IN PAID PLANS") rather than their
 * real value, so those fields are typed to accept both shapes.
 */
export interface Article {
  article_id: string
  link: string
  title: string
  description: string | null
  /** Full text, or a paid-plan placeholder string. */
  content: string | null
  keywords: string[] | null
  /** Author names. */
  creator: string[] | null
  language: string
  country: string[] | null
  category: string[] | null
  datatype: string
  /** e.g. "2026-07-01 06:48:48" */
  pubDate: string
  /** Timezone of `pubDate`, e.g. "UTC". */
  pubDateTZ: string
  /** When we fetched the article, same format as `pubDate`. */
  fetched_at: string
  image_url: string | null
  video_url: string | null
  source_id: string
  source_name: string
  source_priority: number
  source_url: string
  source_icon: string | null
  /** "positive" | "negative" | "neutral" on paid plans, otherwise a placeholder. */
  sentiment: string | null
  sentiment_stats: SentimentStats | string | null
  ai_tag: string[] | string | null
  ai_region: string[] | string | null
  ai_org: string[] | string | null
  ai_summary: string | null
  duplicate: boolean
}

/** Breakdown of sentiment confidence, available on Professional/Corporate plans. */
export interface SentimentStats {
  positive: number
  neutral: number
  negative: number
}

/** Shape of the newsdata.io `/latest` response envelope. */
export interface NewsResponse {
  status: string
  totalResults: number
  results: Article[]
  nextPage: string | null
}
