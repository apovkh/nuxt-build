<script setup lang="ts">
definePageMeta({
  title: 'SSR + cache — useServerQuery',
  subtitle: 'ssr: true · дані фетчаться на сервері й приходять у початковому HTML. Перевір view-source: заголовки вже там.',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'SSR + cache' },
  ],
})

// useServerQuery = useQuery + onServerPrefetch: запит завершується НА СЕРВЕРІ,
// dehydrate у payload, клієнт гідрує кеш без повторного запиту (SEO-friendly).
const news = useNewsRepository()
const { data: articles, isPending, error } = useServerQuery(news.listQuery())

usePageCode([
  {
    title: 'useServerQuery',
    code: `// ssr: true — глобально у nuxt.config
const news = useNewsRepository()

// useQuery + onServerPrefetch: запит на сервері,
// dehydrate у payload, клієнт гідрує кеш без
// повторного мережевого запиту → дані в HTML (SEO)
const { data: articles, isPending, error } = useServerQuery(
  news.listQuery(),
)`,
  },
])
</script>

<template>
  <div>
    <p v-if="isPending">Loading…</p>
    <p v-else-if="error" class="text-error">{{ error.message }}</p>

    <ul v-else class="space-y-4">
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
