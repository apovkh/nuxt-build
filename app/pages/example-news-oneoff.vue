<script setup lang="ts">
import type { Article } from '#shared/types/example/news'

definePageMeta({
  hasCode: true, // грід 2-колонки вже на SSR (див. default.vue)
  title: 'One-off request — useApi',
  subtitle: 'Запит виконується лише за кліком, результат не кешується (перезавантаж сторінку — дані зникнуть).',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'One-off request' },
  ],
})

// useApi (під капотом репозиторію) — разовий запит без кешу й SSR-payload.
// Стан (pending/error/data) керуємо руками — TanStack не задіяний.
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

// useApi під капотом репозиторію — разовий запит без кешу
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
