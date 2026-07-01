<script setup lang="ts">
import type { Article } from '#shared/types/news'

const { data: articles } = await useFetch<Article[]>('/api/news')
console.log(articles)
</script>


<template>
  <div>
    <h1>Hello World</h1>
    <NuxtLink to="/other">Other</NuxtLink>
    <div v-for="article in articles" :key="article.article_id">
      <pre>{{ article }}</pre>
      <NuxtImg :src="article.image_url" :alt="article.title" />
    </div>
  </div>
</template>
