<script setup lang="ts">
definePageMeta({
  title: 'Client cache — useClientQuery',
  subtitle: 'ssr: false · у view-source даних немає — вони підвантажуються запитом у браузері (вкладка Network).',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'Client cache' },
  ],
})

// useClientQuery = useQuery без onServerPrefetch (+ enabled на клієнті):
// запит ЛИШЕ у браузері після гідрації, кеш повноцінний.
const news = useNewsRepository()
const { data: articles, isPending, error } = useClientQuery(news.listQuery())

usePageCode([
  {
    title: 'useClientQuery',
    code: `// routeRules: { '/example-news-spa': { ssr: false } }
const news = useNewsRepository()

// useQuery без onServerPrefetch (+ enabled на клієнті):
// запит лише у браузері, повноцінний кеш/ретраї/invalidate
const { data: articles, isPending, error } = useClientQuery(
  news.listQuery(),
)`,
  },
])
</script>

<template>
  <div>
    <p v-if="isPending">Loading in the browser…</p>
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
