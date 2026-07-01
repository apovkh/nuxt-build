<script setup lang="ts">
// Нативні breadcrumbs (Vuetify не встановлено). Коли додаси Vuetify — заміниш на <VBreadcrumbs :items>.
defineProps<{ items: { title: string, to?: string }[] }>()
</script>

<template>
  <nav class="text-sm mb-5" aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-2 text-secondary">
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
        <NuxtLink v-if="item.to" :to="item.to" class="hover:text-primary">{{ item.title }}</NuxtLink>
        <span v-else class="text-primary">{{ item.title }}</span>
        <span v-if="i < items.length - 1" class="opacity-40">/</span>
      </li>
    </ol>
  </nav>
</template>
