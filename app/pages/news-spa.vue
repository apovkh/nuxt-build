<script setup lang="ts">
// ── Приклад 2: клієнтський кеш (ssr: false) ───────────────────────────────────
// Цей маршрут має routeRules: { '/news-spa': { ssr: false } } у nuxt.config,
// тож на сервері він НЕ рендериться — початковий HTML порожній (немає даних для SEO).
// useClientQuery = useQuery без onServerPrefetch + enabled: import.meta.client,
// тому запит виконується ЛИШЕ у браузері після гідрації. Кеш повноцінний (ретраї,
// invalidateQueries), просто наповнюється на клієнті. Типово для приватних SPA-екранів.
const news = useNewsRepository()
const { data: articles, isPending, error } = useClientQuery(news.listQuery())
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <NuxtLink to="/" class="text-sm text-primary hover:underline">← Home</NuxtLink>

    <h1 class="mt-2 text-2xl font-bold">Client cache — <code>useClientQuery</code></h1>
    <p class="mt-1 text-sm">
      <code>ssr: false</code> · у <code>view-source:</code> даних немає — вони підвантажуються
      запитом у браузері (див. вкладку Network).
    </p>

    <p v-if="isPending" class="mt-6">Loading in the browser…</p>
    <p v-else-if="error" class="mt-6 text-error">{{ error.message }}</p>

    <ul v-else class="mt-6 space-y-4">
      <li v-for="article in articles" :key="article.article_id" class="rounded border border-border p-4">
        <h2 class="font-medium">{{ article.title }}</h2>
        <NuxtImg
          v-if="article.image_url"
          :src="article.image_url"
          :alt="article.title"
          width="320"
          class="mt-2 rounded"
        />
      </li>
    </ul>
  </div>
</template>
