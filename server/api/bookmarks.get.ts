import type { Bookmark } from '#shared/types/bookmarks'

// GET /api/bookmarks — делегує серверному репозиторію.
export default defineEventHandler((): Bookmark[] => {
  return bookmarksRepository.list()
})
