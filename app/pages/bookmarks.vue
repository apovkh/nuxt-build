<script setup lang="ts">
// ── Приклад 4: мутація + автоінвалідація (useApiMutation) ─────────────────────
// Читання і мутація йдуть через useBookmarksRepository (app/repositories):
// list() → queryOptions для useClientQuery; create → mutationFn для useApiMutation.
// Після успіху invalidate: [['bookmarks']] автоматично рефетчить список.
const bookmarksRepo = useBookmarksRepository()

const { data: bookmarks, isPending } = useClientQuery(bookmarksRepo.listQuery())

const title = ref('')

const { mutate: add, isPending: isAdding } = useApiMutation({
  mutationFn: bookmarksRepo.create,
  invalidate: [['bookmarks']],
  onSuccess: () => {
    title.value = ''
  },
})

function submit() {
  const value = title.value.trim()
  if (value) add({ title: value })
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <NuxtLink to="/" class="text-sm text-primary hover:underline">← Home</NuxtLink>

    <h1 class="mt-2 text-2xl font-bold">Mutation + invalidate — <code>useApiMutation</code></h1>
    <p class="mt-1 text-sm">
      Додай закладку → список оновиться автоматично через <code>invalidate: [['bookmarks']]</code>.
      Стор — in-memory (скидається при рестарті сервера), лише для демо.
    </p>

    <form class="mt-6 flex gap-2" @submit.prevent="submit">
      <input
        v-model="title"
        placeholder="Bookmark title"
        class="flex-1 rounded border border-border px-3 py-2"
      >
      <button
        type="submit"
        class="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
        :disabled="isAdding || !title.trim()"
      >
        {{ isAdding ? 'Adding…' : 'Add' }}
      </button>
    </form>

    <p v-if="isPending" class="mt-6">Loading…</p>
    <ul v-else class="mt-6 space-y-2">
      <li v-for="bookmark in bookmarks" :key="bookmark.id" class="rounded border border-border p-3">
        {{ bookmark.title }}
      </li>
      <li v-if="!bookmarks?.length">No bookmarks yet.</li>
    </ul>
  </div>
</template>
