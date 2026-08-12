<script setup lang="ts">
import type { Article } from '#shared/types/example/news'

definePageMeta({
  hasCode: true, // 2-column grid already on SSR (see default.vue)
  title: 'One-off request — useApi',
  subtitle: 'The request runs only on click; the result is not cached (reload the page — the data disappears).',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'One-off request' },
  ],
})

// useApi (under the repository's hood) — a one-off request with no cache or SSR payload.
// State (pending/error/data) is managed by hand — TanStack is not involved.
const news = useNewsRepository()

const articles = ref<Article[]>([])
const pending = ref(false)
const error = ref<string | null>(null)
const loaded = ref(false)

async function load() {
  pending.value = true
  error.value = null
  try {
    articles.value = await news.getAll()
    loaded.value = true
  }
  catch (e) {
    error.value = (e as Error).message
  }
  finally {
    pending.value = false
  }
}

usePageCode([
  {
    title: 'useApi',
    code: `const news = useNewsRepository()

const articles = ref<Article[]>([])
const pending = ref(false)

// useApi under the repository's hood — one-off request, no cache
async function load() {
  pending.value = true
  try {
    articles.value = await news.getAll()
  }
  finally {
    pending.value = false
  }
}`,
  },
])
</script>

<template>
  <div>
    <button
      class="rounded bg-brand-primary px-4 py-2 text-white disabled:opacity-50"
      :disabled="pending"
      @click="load"
    >
      {{ pending ? 'Fetching…' : 'Fetch news now' }}
    </button>

    <p v-if="error" class="mt-4 text-error">
      {{ error }}
    </p>
    <p v-else-if="loaded && !articles.length" class="mt-4">
      No articles.
    </p>

    <ul class="mt-6 space-y-2">
      <li v-for="article in articles" :key="article.article_id" class="rounded border border-border p-3">
        {{ article.title }}
      </li>
    </ul>
  </div>
</template>
