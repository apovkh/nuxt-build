<script setup lang="ts">
import { listPosts } from '~/repositories/posts'

// Той самий репозиторій, що й у формі — тепер як queryFn кешованого запиту.
const { data: posts, isPending } = useClientQuery({
  queryKey: ['posts'],
  queryFn: listPosts,
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-medium mb-4">Posts</h1>

    <p v-if="isPending">Завантаження…</p>
    <ul v-else class="space-y-2">
      <li v-for="post in posts" :key="post.id">
        <NuxtLink :to="{ name: 'posts-id', params: { id: post.id } }" class="text-primary">
          {{ post.title }}
        </NuxtLink>
      </li>
    </ul>

    <NuxtLink to="/posts/create" class="inline-block mt-4 text-primary">+ Create post</NuxtLink>
  </div>
</template>
