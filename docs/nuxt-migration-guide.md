# Nuxt Migration Guide — AngularJS/React → Nuxt (SSR + caching)

Guide for rewriting a legacy system to Nuxt, split into a public SSR layer and a private SPA admin with caching. Intended to live in the target repository as a team reference.

---

## 0. Context: typical starting point

The guide assumes a legacy system where:

- the frontend is AngularJS 1.x or an early React SPA (often several apps under one domain);
- there is no cache: every controller/component fetches independently, and `cache: true` appears only in vendor libraries;
- requests are scattered across hundreds of files (`$http`/`$resource`/`fetch` used directly, no transport layer);
- polling is done with timers (`$interval`/`setInterval`) inside the components themselves.

**The migration goal is not parity but improvement:** add a cache layer for UX and proper SSR for public flows.

Before starting, build two tables — public routes (§3.1) and private ones (§3.2); they dictate the `routeRules`.

---

## 1. Core principle: cache ≠ SEO

These are different axes and must not be mixed:

- **SEO/rendering** delivers server HTML with content and meta tags (native `useAsyncData`/`useFetch` + `useSeoMeta`).
- **Cache** (TanStack Query) manages data on the client *after* hydration — speed and smoothness, **not** search.

Rule: SEO content → server-render via native fetch; UX interactivity → TanStack. Never serve SEO-critical content only through a client-side `useQuery` — it won't be in the initial HTML.

---

## 2. Per-route rendering strategy (`routeRules`)

One Nuxt, different modes on different routes.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // default
  routeRules: {
    '/accessibility/**': { prerender: true },            // SSG, indexed
    '/login/**':         { ssr: true,  robots: false },  // SSR, noindex
    '/session/**':       { ssr: true,  robots: false },  // high-volume end-user flow, noindex
    '/admin/**':         { ssr: false },                 // SPA + TanStack
    '/catalog/**':       { ssr: false },
    '/users/**':         { ssr: false },
    '/analytics/**':     { ssr: false },
  },
})
```

---

## 3. Page breakdown

### 3.1 Public layer → SSR/SSG + native fetch (no TanStack)

Fill in the table for your system — one row per route:

| Page type | Auth | Rendering | Data | SEO |
|---|---|---|---|---|
| Static content (legal information, landing pages) | no | **SSG** (`prerender`) | none | ✅ index + hreflang |
| Login / password reset / OTP forms | no | **SSR** | `$fetch` on submit | `noindex` |
| Access via token or one-time link | token | **SSR** | native `useAsyncData` by token | `noindex` |

Keep the high-volume end-user flow (what the system is opened for most often) on SSR: the first screen must be fast and accessible without JS. TanStack is not needed here.

### 3.2 Private admin → SPA (`ssr: false`) + TanStack cache

| Route type | Data approach |
|---|---|
| Table lists that change in real time | `useClientQuery` + polling (`refetchInterval`) |
| Entity builders/editors | cache + optimistic mutations |
| Reference and lookup data | long `staleTime`, shared `queryKey` |
| User and role administration | cache + `invalidateQueries` after mutations |
| Analytics and reports | **prime candidate** — heavy aggregations and filters, caching is a must |

SEO is zero here (behind login) → `ssr: false`, TanStack at full capacity.

---

## 4. TanStack Query setup

### 4.1 Plugin (once)

```ts
// plugins/vue-query.ts
import { VueQueryPlugin, QueryClient, hydrate, dehydrate,
         type DehydratedState, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { defineNuxtPlugin, useState } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 }, // prevents double-fetch after hydration
    },
  })

  nuxt.vueApp.use(VueQueryPlugin, { queryClient } as VueQueryPluginOptions)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => { vueQueryState.value = dehydrate(queryClient) })
  }
  if (import.meta.client) {
    hydrate(queryClient, vueQueryState.value)
  }
})
```

### 4.2 Composables (presets per scenario)

```ts
// composables/useServerQuery.ts — SSR + cache (for routes with ssr: true)
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
```

```ts
// composables/useClientQuery.ts — client-side cache (for the SPA admin)
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

export function useClientQuery<T>(options: UseQueryOptions<T>) {
  return useQuery({
    ...options,
    enabled: import.meta.client && (options.enabled ?? true),
  })
}
```

```ts
// composables/useApiMutation.ts — backend commands + auto-invalidation
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/vue-query'

export function useApiMutation<TData, TVars>(
  options: UseMutationOptions<TData, Error, TVars> & { invalidate?: unknown[][] },
) {
  const qc = useQueryClient()
  return useMutation({
    ...options,
    onSuccess: (data, vars, ctx) => {
      options.invalidate?.forEach((key) => qc.invalidateQueries({ queryKey: key }))
      options.onSuccess?.(data, vars, ctx)
    },
  })
}
```

```ts
// composables/useApi.ts — JUST a request: data without cache (thin wrapper over $fetch)
// No TanStack, no SSR payload. For one-off calls. Need cache → use*Query; SSR → useFetch.
export function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  return $fetch<T>(url, opts)
}
```

### 4.3 Query functions

```ts
// composables/queries.ts
import { queryOptions } from '@tanstack/vue-query'

export const ordersQuery = () => queryOptions({
  queryKey: ['orders'],
  queryFn: () => $fetch('/api/orders'),
  refetchInterval: 15_000, // instead of a polling timer inside the table itself
})

export const statusesQuery = () => queryOptions({
  queryKey: ['catalog', 'statuses'],
  queryFn: () => $fetch('/api/catalog/statuses'),
  staleTime: Infinity, // lookup data: one fetch per session (used to be a request in every modal)
})
```

### 4.4 Usage

```vue
<script setup lang="ts">
// admin (SPA)
const { data: orders } = useClientQuery(ordersQuery())

const { mutate: changeStatus } = useApiMutation({
  mutationFn: (body) => $fetch('/api/orders/change-status', { method: 'POST', body }),
  invalidate: [['orders']],
})
</script>
```

**Composable selection rule:** SSR page with cache → `useServerQuery`; SPA admin → `useClientQuery`; data changes → `useApiMutation`; one-off request without cache (just a request) → `useApi` (or native `useFetch` if SSR without cache is needed).

---

## 5. SEO (public layer only)

```vue
<script setup lang="ts">
// e.g. accessibility-statement
useSeoMeta({
  title: 'Accessibility Statement',
  description: '...',
  ogTitle: '...',
  ogDescription: '...',
})
</script>
```

- Modules: `@nuxtjs/sitemap`, `@nuxtjs/robots`.
- Multilingual: `@nuxtjs/i18n` with `hreflang` and localized URLs.
- `robots: false` in `routeRules` for routes that are publicly accessible but not meant for indexing (login, token-based access).

---

## 6. GEO (Generative Engine Optimization) — deferred

If there is no public content layer yet (landing page, blog, public reports), GEO **has nothing to apply to**: when only static pages are indexed, SSG + correct meta is enough for them.

Return to GEO once public content appears. Then, on top of the same SSR: structured data (schema.org / JSON-LD), semantically clean server-rendered HTML (AI crawlers execute JS poorly), and `llms.txt` if needed. There is no separate "GEO architecture" — it is quality SEO + structured data.

---

## 7. Migration order (recommended)

1. Nuxt skeleton + `routeRules` + the `vue-query.ts` plugin + the 4 composables.
2. Public layer (the simplest, biggest end-user value): static pages → login flow → the main end-user flow on SSR.
3. Admin module by module, from simple to complex: reference data and user management first, then lists, builders/editors last.
4. Analytics — port as a SPA section with TanStack (caching pays off most here).
5. Replace all timer-based polling with `refetchInterval`; all direct POST calls → `useApiMutation` with `invalidate`.

---

## Summary

- **Cache and SEO are different problems.** Don't solve SEO with a cache.
- **Public flows** (static pages, login, the main end-user flow) → SSR/SSG + native fetch + meta.
- **Private admin and analytics** → SPA (`ssr: false`) + TanStack cache.
- **Defer GEO** until public content appears.
- One Nuxt, two modes via `routeRules`.
