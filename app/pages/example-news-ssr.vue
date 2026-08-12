<script setup lang="ts">
definePageMeta({
  title: 'SSR + cache — useServerQuery',
  subtitle: 'ssr: true · data is fetched on the server and arrives in the initial HTML. Check view-source: the titles are already there.',
  maxWidth: 'max-w-[1600px]',
  // Static flag: the layout draws the 2-column grid already on SSR (see default.vue),
  // so there is no 1→2 column jump after hydration. Pairs with usePageCode below.
  hasCode: true,
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'SSR + cache' },
  ],
})

// useServerQuery = useQuery + await suspense: the request finishes before render.
// On the server (onServerPrefetch) → dehydrate into the payload → data in the HTML (SEO);
// on client-side navigation, await holds the transition via <Suspense> → no Loading flash.
const news = useNewsRepository()

usePageCode([
  {
    title: 'useServerQuery',
    code: `// ssr: true — globally in nuxt.config
const news = useNewsRepository()

// await useServerQuery: on the server onServerPrefetch puts
// data into dehydrate/HTML (SEO), on the client await holds
// the transition (Suspense) → data ready for render, no Loading
const { data: articles, error } = await useServerQuery(
  news.listQuery(),
)`,
  },
])

// await → data is guaranteed ready for render (SSR and client-side navigation).
const { data: articles, error } = await useServerQuery(news.listQuery())
</script>

<template>
  <div>
    <p v-if="error" class="text-error">
      {{ error.message }}
    </p>

    <ul v-else class="space-y-4">
      <li v-for="article in articles" :key="article.article_id" class="rounded border border-border p-4">
        <h2 class="font-medium">
          {{ article.title }}
        </h2>
        <!-- A fixed box (320×180) + object-cover reserves space before load →
             zero CLS (images don't jump). The h-/w- classes are needed because Tailwind
             preflight sets img{height:auto}, which would override the height attribute.
             bg-muted — a neutral placeholder until the first pixel arrives; loading=eager
             — start fetching immediately (images are above the fold). -->
        <NuxtImg
          v-if="article.image_url"
          :src="article.image_url"
          :alt="article.title"
          width="320"
          height="180"
          loading="eager"
          class="mt-2 h-[180px] w-[320px] rounded bg-muted object-cover"
        />
      </li>
    </ul>
  </div>
</template>
