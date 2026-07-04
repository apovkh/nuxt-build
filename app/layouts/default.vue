<script setup lang="ts">
import type { CodeTab } from '~/composables/example/usePageCode'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const crumbs = computed(() =>
  (route.meta.breadcrumbs as { title: string, to?: string }[] | undefined) ?? [],
)
const title = computed(() => route.meta.title as string | undefined)
const subtitle = computed(() => route.meta.subtitle as string | undefined)
const maxWidth = computed(() => route.meta.maxWidth as string | undefined)

// Код правої колонки — з usePageCode() поточної сторінки (по маршруту).
const store = useState<Record<string, CodeTab[]>>('page-code', () => ({}))
const code = computed(() => store.value[route.path] ?? [])
// hasCode гейтимо на СТАТИЧНОМУ route.meta.hasCode: воно доступне на SSR ДО того, як
// сторінка (дитина) через usePageCode наповнить store. Інакше layout (батько) вирішує
// v-if раніше за дитину → SSR рендерить 1 колонку, а клієнт (payload вже повний) — 2
// → стрибок + hydration mismatch. Фолбек на store лишаємо для клієнтської навігації.
const hasCode = computed(() => Boolean(route.meta.hasCode) || code.value.length > 0)

const hasShell = computed(() => Boolean(title.value || maxWidth.value || hasCode.value))
</script>

<template>
  <!-- Page-shell -->
  <div v-if="hasShell" class="mx-auto px-6 pb-6 pt-4" :class="[maxWidth || 'max-w-6xl']">
    <AppBreadcrumbs v-if="crumbs.length" :items="crumbs" />

    <!-- Блок: заголовок + опис -->
    <div v-if="title || subtitle" class="mb-6">
      <h1 v-if="title" class="text-xl font-medium">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-secondary text-sm mt-1">
        {{ subtitle }}
      </p>
    </div>

    <!-- Дві колонки: ліворуч дані (slot), праворуч код -->
    <div v-if="hasCode" class="grid gap-6 lg:grid-cols-2">
      <div>
        <slot />
      </div>
      <div class="space-y-4">
        <ExampleCodeCopy v-for="tab in code" :key="tab.title" :title="tab.title" :code="tab.code" />
      </div>
    </div>

    <!-- Без коду — просто контент -->
    <slot v-else />
  </div>

  <!-- Сторінки без shell керують власним контейнером; layout лише додає breadcrumbs -->
  <div v-else>
    <div v-if="crumbs.length" class="mx-auto max-w-6xl px-6 pt-6">
      <AppBreadcrumbs :items="crumbs" />
    </div>
    <slot />
  </div>
</template>
