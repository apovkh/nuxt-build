<script setup lang="ts">
definePageMeta({
  hasCode: true, // грід 2-колонки вже на SSR (див. default.vue)
  title: 'Mutation + invalidate — useApiMutation',
  subtitle: 'Додай закладку → список оновиться автоматично через invalidate: [[\'bookmarks\']]. Стор in-memory, лише для демо.',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'Mutation + invalidate' },
  ],
})

// Читання і мутація — через useBookmarksRepository. Після успіху invalidate рефетчить список.
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

  if (value)
    add({ title: value })
}

usePageCode([
  {
    title: 'useApiMutation',
    code: `const repo = useBookmarksRepository()

// читання — кешований запит
const { data: bookmarks } = useClientQuery(repo.listQuery())

// мутація + автоінвалідація списку після успіху
const { mutate: add, isPending } = useApiMutation({
  mutationFn: repo.create,
  invalidate: [['bookmarks']],
})`,
  },
])
</script>

<template>
  <div>
    <form class="flex gap-2" @submit.prevent="submit">
      <input
        v-model="title"
        placeholder="Bookmark title"
        class="flex-1 rounded border border-border px-3 py-2"
      >
      <button
        type="submit"
        class="rounded bg-brand-primary px-4 py-2 text-white disabled:opacity-50"
        :disabled="isAdding || !title.trim()"
      >
        {{ isAdding ? 'Adding…' : 'Add' }}
      </button>
    </form>

    <p v-if="isPending" class="mt-6">
      Loading…
    </p>
    <ul v-else class="mt-6 space-y-2">
      <li v-for="bookmark in bookmarks" :key="bookmark.id" class="rounded border border-border p-3">
        {{ bookmark.title }}
      </li>
      <li v-if="!bookmarks?.length">
        No bookmarks yet.
      </li>
    </ul>
  </div>
</template>
