<script setup lang="ts">
definePageMeta({
  hasCode: true, // 2-column grid already on SSR (see default.vue)
  title: 'Client cache — useClientQuery',
  subtitle: 'ssr: false · view-source has no data — it is loaded by a request in the browser (Network tab).',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Client cache' },
  ],
})

// useClientQuery = useQuery without onServerPrefetch (+ enabled on the client):
// the request runs ONLY in the browser after hydration, with a full-featured cache.
const news = useNewsRepository()
const { data: articles, isPending, error } = useClientQuery(news.listQuery())

usePageCode([
  {
    title: 'useClientQuery',
    code: `// routeRules: { '/example-news-spa': { ssr: false } }
const news = useNewsRepository()

// useQuery without onServerPrefetch (+ enabled on the client):
// request only in the browser, full cache/retries/invalidate
const { data: articles, isPending, error } = useClientQuery(
  news.listQuery(),
)`,
  },
])
</script>

<template>
  <div>
    <p v-if="isPending">
      Loading in the browser…
    </p>
    <p v-else-if="error" class="text-error">
      {{ error.message }}
    </p>

    <ul v-else class="space-y-4">
      <li v-for="article in articles" :key="article.article_id" class="rounded border border-border p-4">
        <h2 class="font-medium">
          {{ article.title }}
        </h2>
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
