<script setup lang="ts">
import type { Article } from '#shared/types/news'

// ── Приклад 3: разовий запит без кешу (useApi) ────────────────────────────────
// useApi — тонка типізована обгортка над $api ($fetch з інтерсепторами). БЕЗ кешу,
// БЕЗ SSR-payload. Підходить для дій «на вимогу»: експорт, перевірка, службовий виклик.
// Стан (pending/error/data) керуємо руками — TanStack тут не задіяний.
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
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <NuxtLink to="/" class="text-sm text-primary hover:underline">← Home</NuxtLink>

    <h1 class="mt-2 text-2xl font-bold">One-off request — <code>useApi</code></h1>
    <p class="mt-1">
      Запит виконується лише за кліком, результат не кешується (перезавантаж сторінку — дані зникнуть).
    </p>

    <button
      class="mt-6 rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
      :disabled="pending"
      @click="load"
    >
      {{ pending ? 'Fetching…' : 'Fetch news now' }}
    </button>

    <p v-if="error" class="mt-4 text-error">{{ error }}</p>
    <p v-else-if="loaded && !articles.length">No articles.</p>

    <ul class="mt-6 space-y-2">
      <li v-for="article in articles" :key="article.article_id" class="rounded border border-border p-3">
        {{ article.title }}
      </li>
    </ul>
  </div>
</template>
