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

// useServerQuery = useQuery + await suspense: запит завершується до рендеру.
// На сервері (onServerPrefetch) → dehydrate у payload → дані в HTML (SEO); при
// клієнтській навігації await тримає перехід через <Suspense> → без спалаху Loading.
const news = useNewsRepository()

usePageCode([
  {
    title: 'useServerQuery',
    code: `// ssr: true — глобально у nuxt.config
const news = useNewsRepository()

// await useServerQuery: на сервері onServerPrefetch кладе
// дані у dehydrate/HTML (SEO), на клієнті await тримає
// перехід (Suspense) → дані готові до рендеру, без Loading
const { data: articles, error } = await useServerQuery(
  news.listQuery(),
)`,
  },
])

// await → дані гарантовано готові до рендеру (SSR і клієнтська навігація).
const { data: articles, error } = await useServerQuery(news.listQuery())
</script>

<template>
  <div>
    <p v-if="error" class="text-error">{{ error.message }}</p>

    <ul v-else class="space-y-4">
      <li v-for="article in articles" :key="article.article_id" class="rounded border border-border p-4">
        <h2 class="font-medium">{{ article.title }}</h2>
        <!-- Фіксований бокс (320×180) + object-cover резервує місце до завантаження →
             нуль CLS (картинки не стрибають). h-/w- класи потрібні, бо Tailwind
             preflight ставить img{height:auto} і перебив би атрибут height.
             bg-muted — нейтральний плейсхолдер, поки піксель не прийшов; loading=eager
             — почати тягнути одразу (картинки над згином). -->
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
