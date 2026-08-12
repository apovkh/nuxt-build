import type { Bookmark } from '#shared/types/example/bookmarks'

// GET /api/bookmarks — delegates to the server repository.
export default defineEventHandler((): Bookmark[] => {
  return bookmarksRepository.list()
})
