import type { Bookmark } from '#shared/types/example/bookmarks'

// GET /api/bookmarks — делегує серверному репозиторію.
export default defineEventHandler((): Bookmark[] => {
  return bookmarksRepository.list()
})
