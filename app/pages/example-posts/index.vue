<script setup lang="ts">
import { listPosts } from '~/repositories/example/posts'

definePageMeta({
  hasCode: true, // 2-column grid already on SSR (see default.vue)
  title: 'Posts — useClientQuery',
  subtitle: 'The same repository as in the create form, now as the queryFn of a cached query.',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Posts' },
  ],
})

const { data: posts, isPending } = useClientQuery({
  queryKey: ['posts'],
  queryFn: listPosts,
})

usePageCode([
  {
    title: 'useClientQuery + repo',
    code: `import { listPosts } from '~/repositories/example/posts'

// the same repository as in the form — as queryFn
const { data: posts, isPending } = useClientQuery({
  queryKey: ['posts'],
  queryFn: listPosts,
})`,
  },
])
</script>

<template>
  <div>
    <p v-if="isPending">
      Loading…
    </p>
    <ul v-else class="space-y-2">
      <li v-for="post in posts" :key="post.id">
        <NuxtLink :to="{ name: 'example-posts-id', params: { id: post.id } }" class="text-brand-primary">
          {{ post.title }}
        </NuxtLink>
      </li>
    </ul>

    <NuxtLink to="/example-posts/create" class="inline-block mt-4 text-brand-primary">
      + Create post
    </NuxtLink>
  </div>
</template>
