<script setup lang="ts">
import type { Article } from '#shared/types/news'

// Нативний Nuxt-варіант (для контрасту з core-composables нижче):
// useFetch — SSR + перенос payload на клієнт, АЛЕ без TanStack-кешу/інвалідації.
const { data: articles } = await useFetch<Article[]>('/api/news')

const examples = [
  { to: '/news-ssr', title: 'SSR + cache', composable: 'useServerQuery', note: 'ssr: true · дані в HTML (SEO)' },
  { to: '/news-spa', title: 'Client cache', composable: 'useClientQuery', note: 'ssr: false · запит у браузері' },
  { to: '/news-oneoff', title: 'One-off request', composable: 'useApi', note: 'без кешу, на вимогу' },
  { to: '/bookmarks', title: 'Mutation + invalidate', composable: 'useApiMutation', note: 'POST + автооновлення списку' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <h1 class="text-2xl font-bold">app/core — приклади data-fetching</h1>
    <p class="mt-1 text-sm">
      Кожна сторінка демонструє свій composable ядра для сценарію SSR true / false.
    </p>

    <ul class="mt-6 grid gap-3 sm:grid-cols-2">
      <li v-for="example in examples" :key="example.to">
        <NuxtLink
          :to="example.to"
          class="block rounded border border-border p-4 transition hover:border-primary"
        >
          <div class="font-medium">{{ example.title }}</div>
          <code class="text-sm text-primary">{{ example.composable }}</code>
          <div class="mt-1 text-xs">{{ example.note }}</div>
        </NuxtLink>
      </li>
    </ul>

    <section class="mt-10">
      <h2 class="text-lg font-semibold">Native <code>useFetch</code> (SSR, без TanStack-кешу)</h2>
      <p class="text-sm">Вбудований варіант Nuxt — коли кеш/інвалідація не потрібні.</p>
      <ul class="mt-3 space-y-1">
        <li v-for="article in articles" :key="article.article_id" class="text-sm">
          {{ article.title }}
        </li>
      </ul>
    </section>
  </div>
</template>
