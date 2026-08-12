import type { Bookmark } from '#shared/types/example/bookmarks'

// Server-side data access for the "bookmarks" resource — in-memory demo store.
// Module-level state → shared between requests, reset on server restart. Demo only.
const bookmarks: Bookmark[] = []

export const bookmarksRepository = {
  list: (): Bookmark[] => bookmarks,

  add(title: string): Bookmark {
    const bookmark: Bookmark = { id: crypto.randomUUID(), title }
    bookmarks.push(bookmark)

    return bookmark
  },
}
