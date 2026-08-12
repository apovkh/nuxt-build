import type { Bookmark } from '#shared/types/example/bookmarks'

// POST /api/bookmarks — validates title and delegates to the server repository.
export default defineEventHandler(async (event): Promise<Bookmark> => {
  const body = await readBody<{ title?: string }>(event)
  const title = body?.title?.trim()

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }

  return bookmarksRepository.add(title)
})
