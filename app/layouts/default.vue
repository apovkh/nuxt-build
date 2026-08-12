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

// Right-column code — from usePageCode() of the current page (keyed by route).
const store = useState<Record<string, CodeTab[]>>('page-code', () => ({}))
const code = computed(() => store.value[route.path] ?? [])
// hasCode is gated on the STATIC route.meta.hasCode: it is available on SSR BEFORE the
// page (child) fills the store via usePageCode. Otherwise the layout (parent) resolves
// v-if before the child → SSR renders 1 column while the client (payload already full) — 2
// → layout jump + hydration mismatch. The store fallback stays for client-side navigation.
const hasCode = computed(() => Boolean(route.meta.hasCode) || code.value.length > 0)

const hasShell = computed(() => Boolean(title.value || maxWidth.value || hasCode.value))
</script>

<template>
  <!-- Page-shell -->
  <div v-if="hasShell" class="mx-auto px-6 pb-6 pt-4" :class="[maxWidth || 'max-w-6xl']">
    <AppBreadcrumbs v-if="crumbs.length" :items="crumbs" />

    <!-- Block: title + description -->
    <div v-if="title || subtitle" class="mb-6">
      <h1 v-if="title" class="text-xl font-medium">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-secondary text-sm mt-1">
        {{ subtitle }}
      </p>
    </div>

    <!-- Two columns: data on the left (slot), code on the right -->
    <div v-if="hasCode" class="grid gap-6 lg:grid-cols-2">
      <div>
        <slot />
      </div>
      <div class="space-y-4">
        <ExampleCodeCopy v-for="tab in code" :key="tab.title" :title="tab.title" :code="tab.code" />
      </div>
    </div>

    <!-- No code — just the content -->
    <slot v-else />
  </div>

  <!-- Pages without a shell manage their own container; the layout only adds breadcrumbs -->
  <div v-else>
    <div v-if="crumbs.length" class="mx-auto max-w-6xl px-6 pt-6">
      <AppBreadcrumbs :items="crumbs" />
    </div>
    <slot />
  </div>
</template>
