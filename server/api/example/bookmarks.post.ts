import type { Bookmark } from '#shared/types/bookmarks'

// POST /api/bookmarks — валідовує title і делегує серверному репозиторію.
export default defineEventHandler(async (event): Promise<Bookmark> => {
  const body = await readBody<{ title?: string }>(event)
  const title = body?.title?.trim()

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }

  return bookmarksRepository.add(title)
})
