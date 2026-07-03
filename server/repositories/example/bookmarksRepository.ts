import type { Bookmark } from '#shared/types/example/bookmarks'

// Серверний data-access ресурсу "bookmarks" — in-memory demo store.
// Стан на рівні модуля → спільний між запитами, скидається при рестарті сервера. Лише для демо.
const bookmarks: Bookmark[] = []

export const bookmarksRepository = {
  list: (): Bookmark[] => bookmarks,

  add(title: string): Bookmark {
    const bookmark: Bookmark = { id: crypto.randomUUID(), title }
    bookmarks.push(bookmark)
    return bookmark
  },
}
