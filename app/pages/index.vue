<script setup lang="ts">
import type { Article } from '#shared/types/example/news'

// Native Nuxt variant (for contrast with the core composables below):
// useFetch — SSR + payload transfer to the client, BUT no TanStack cache/invalidation.
const { data: articles } = await useFetch<Article[]>('/api/example/news')

const examples = [
  { to: '/example-news-ssr', title: 'SSR + cache', composable: 'useServerQuery', note: 'ssr: true · data in the HTML (SEO)' },
  { to: '/example-news-spa', title: 'Client cache', composable: 'useClientQuery', note: 'ssr: false · request in the browser' },
  { to: '/example-news-oneoff', title: 'One-off request', composable: 'useApi', note: 'no cache, on demand' },
  { to: '/example-bookmarks', title: 'Mutation + invalidate', composable: 'useApiMutation', note: 'POST + auto-refreshed list' },
  { to: '/example-errors', title: 'Error handling', composable: 'useApiError + notifier', note: 'errors per request type' },
]

const forms = [
  { to: '/example-form', title: 'Live validation', composable: 'useForm', note: 'client + server (422)' },
  { to: '/example-posts/create', title: 'Create post', composable: 'useForm + repo', note: 'addPost · field validation' },
  { to: '/example-login', title: 'Login', composable: 'useForm + repo', note: 'login · token in onSuccess' },
]
</script>

<template>
  <div class="mx-auto max-w-[1600px] px-6 pb-6 pt-4">
    <h1 class="text-2xl font-bold">
      app/core — data-fetching examples
    </h1>
    <p class="mt-1 text-sm">
      Each page demonstrates its own core composable for the SSR true / false scenario.
    </p>

    <section class="mt-6">
      <h2 class="text-lg font-semibold">
        Design system
      </h2>
      <p class="text-sm">
        Core colors and typography — a single source for Vuetify and Tailwind.
      </p>
      <NuxtLink
        to="/tokens"
        class="mt-3 flex items-center gap-4 rounded border border-border p-4 transition hover:border-brand-primary"
      >
        <div class="flex shrink-0 gap-1.5">
          <span class="size-8 rounded bg-brand-secondary" />
          <span class="size-8 rounded bg-brand-primary" />
          <span class="size-8 rounded bg-brand-primary-200" />
          <span class="size-8 rounded bg-brand-accent" />
          <span class="size-8 rounded bg-brand-accent-600" />
        </div>
        <div>
          <div class="font-medium">
            Design tokens
          </div>
          <code class="text-sm text-brand-primary">~/core/tokens</code>
          <div class="mt-1 text-xs">
            palette swatches · text in different colors and sizes · theme toggle
          </div>
        </div>
      </NuxtLink>
    </section>

    <ul class="mt-6 grid gap-3 sm:grid-cols-2">
      <li v-for="example in examples" :key="example.to">
        <NuxtLink
          :to="example.to"
          class="block rounded border border-border p-4 transition hover:border-brand-primary"
        >
          <div class="font-medium">
            {{ example.title }}
          </div>
          <code class="text-sm text-brand-primary">{{ example.composable }}</code>
          <div class="mt-1 text-xs">
            {{ example.note }}
          </div>
        </NuxtLink>
      </li>
    </ul>

    <section class="mt-10">
      <h2 class="text-lg font-semibold">
        Forms — <code>useForm</code>
      </h2>
      <p class="text-sm">
        Client-side validation (rules) + server-side (422) merged into a single <code>errors</code>.
      </p>
      <ul class="mt-3 grid gap-3 sm:grid-cols-2">
        <li v-for="form in forms" :key="form.to">
          <NuxtLink
            :to="form.to"
            class="block rounded border border-border p-4 transition hover:border-brand-primary"
          >
            <div class="font-medium">
              {{ form.title }}
            </div>
            <code class="text-sm text-brand-primary">{{ form.composable }}</code>
            <div class="mt-1 text-xs">
              {{ form.note }}
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="mt-10">
      <h2 class="text-lg font-semibold">
        Native <code>useFetch</code> (SSR, no TanStack cache)
      </h2>
      <p class="text-sm">
        Nuxt's built-in option — when cache/invalidation isn't needed.
      </p>
      <ul class="mt-3 space-y-1">
        <li v-for="article in articles" :key="article.article_id" class="text-sm">
          {{ article.title }}
        </li>
      </ul>
    </section>
  </div>
</template>
