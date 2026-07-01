<script setup lang="ts">
// ── Приклад 1: SSR + кеш (ssr: true) ──────────────────────────────────────────
// Маршрут рендериться на сервері (глобальний ssr: true у nuxt.config).
// useServerQuery = useQuery + onServerPrefetch: запит завершується НА СЕРВЕРІ,
// vue-query dehydrate'ить результат у payload, клієнт гідрує кеш і НЕ робить
// повторний мережевий запит у межах staleTime. Дані вже є в HTML → добре для SEO.
const news = useNewsRepository()
const { data: articles, isPending, error } = useServerQuery(news.listQuery())
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <NuxtLink to="/" class="text-sm text-primary hover:underline">← Home</NuxtLink>

    <h1 class="mt-2 text-2xl font-bold">SSR + cache — <code>useServerQuery</code></h1>
    <p class="mt-1 text-sm">
      <code>ssr: true</code> · дані фетчаться на сервері й приходять у початковому HTML.
      Перевір <code>view-source:</code> — заголовки статей уже там.
    </p>

    <p v-if="isPending" class="mt-6">Loading…</p>
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
