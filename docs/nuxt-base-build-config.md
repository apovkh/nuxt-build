# Nuxt Base Build — configuration and conventions

A reusable base for new Nuxt projects. Covers the setup for data-fetching composables **and beyond** — HTTP client, env, SEO, i18n, structure, tooling. Project-agnostic: copy it into a new project and fine-tune it there.

---

## 0. Project structure

```
project/
├─ nuxt.config.ts
├─ .env / .env.example
├─ app/
│  ├─ composables/
│  │  ├─ useServerQuery.ts     # SSR + cache
│  │  ├─ useClientQuery.ts     # client-side cache
│  │  ├─ useApiMutation.ts     # mutations + invalidation
│  │  └─ useApi.ts             # JUST a request: one-off call, no cache (not TanStack)
│  ├─ repositories/            # client-side data access: use<Domain>Repository()
│  │  ├─ useNewsRepository.ts       #   listQuery() → queryOptions (read) + getAll() (raw)
│  │  └─ useBookmarksRepository.ts  #   listQuery() + create() (mutation)
│  ├─ plugins/
│  │  ├─ vue-query.ts          # TanStack init + hydration
│  │  └─ api.ts                # $fetch instance with interceptors
│  ├─ utils/
│  │  └─ config.ts             # single source of defaults (see §1)
│  └─ types/
└─ server/
   ├─ api/                     # thin Nitro routes: read config, delegate
   │  └─ news.get.ts
   └─ repositories/            # server-side data access: external APIs/DB/secrets
      └─ newsRepository.ts     #   (registered in nitro.imports.dirs)
```

---

## 1. Single point of configuration

So the base is easy to tune per project, all defaults live in one place.

```ts
// app/utils/config.ts
export const API_CONFIG = {
  // HTTP
  baseURL: '',                 // set via runtimeConfig, see §3
  timeout: 30_000,
  retry: 1,
  retryDelay: 500,

  // TanStack Query defaults
  query: {
    staleTime: 60_000,         // prevents double-fetch after SSR hydration
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  },

  // Default polling for "live" lists
  pollingInterval: 15_000,
} as const

export type ApiConfig = typeof API_CONFIG
```

From here on, import `API_CONFIG` everywhere instead of hardcoding numbers.

---

## 2. HTTP client (`$fetch` instance with interceptors)

Base client: baseURL, auth headers, unified error handling, refresh/redirect on 401. Used both in composables and directly.

```ts
// app/plugins/api.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { token, clear } = useAuth?.() ?? { token: ref(null), clear: () => {} }

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    timeout: API_CONFIG.timeout,
    retry: API_CONFIG.retry,
    retryDelay: API_CONFIG.retryDelay,

    onRequest({ options }) {
      if (token?.value) {
        options.headers = { ...options.headers, Authorization: `Bearer ${token.value}` }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        clear?.()
        if (import.meta.client) navigateTo('/login')
      }
      // centralized error logging/toasts go here as well
    },
  })

  return { provide: { api } } // available as useNuxtApp().$api
})
```

In `queryFn`/mutations, use `useNuxtApp().$api` instead of bare `$fetch` so the interceptors apply.

---

## 3. Env and runtimeConfig

```ts
// nuxt.config.ts (excerpt)
runtimeConfig: {
  // private (server only)
  apiSecret: process.env.NUXT_API_SECRET,
  // public (client + server)
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    appEnv:  process.env.NUXT_PUBLIC_APP_ENV || 'development',
  },
},
```

```bash
# .env.example
NUXT_PUBLIC_API_BASE=https://api.example.com
NUXT_PUBLIC_APP_ENV=development
NUXT_API_SECRET=
```

Rule: no URLs/secrets in code — only via `runtimeConfig`.

---

## 4. TanStack Query — plugin and defaults

```ts
// app/plugins/vue-query.ts
import { VueQueryPlugin, QueryClient, hydrate, dehydrate,
         type DehydratedState, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { defineNuxtPlugin, useState } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: { queries: { ...API_CONFIG.query } },
  })

  nuxt.vueApp.use(VueQueryPlugin, { queryClient } as VueQueryPluginOptions)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => { vueQueryState.value = dehydrate(queryClient) })
  }
  if (import.meta.client) hydrate(queryClient, vueQueryState.value)
})
```

---

## 5. Composables — request presets

```ts
// app/composables/useServerQuery.ts — SSR + cache
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'
export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
```

```ts
// app/composables/useClientQuery.ts — client-side cache
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
export function useClientQuery<T>(options: UseQueryOptions<T>) {
  return useQuery({ ...options, enabled: import.meta.client && (options.enabled ?? true) })
}
```

```ts
// app/composables/useApiMutation.ts — mutations + invalidation
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/vue-query'
export function useApiMutation<TData, TVars>(
  options: UseMutationOptions<TData, Error, TVars> & { invalidate?: unknown[][] },
) {
  const qc = useQueryClient()
  return useMutation({
    ...options,
    onSuccess: (d, v, c) => {
      options.invalidate?.forEach((key) => qc.invalidateQueries({ queryKey: key }))
      options.onSuccess?.(d, v, c)
    },
  })
}
```

```ts
// app/composables/useApi.ts
// ⚠️ JUST A REQUEST. No cache, no TanStack, no SSR payload.
// Direct wrapper over $fetch/$api for one-off calls (export, check, utility call).
// Returns Promise<T>. If you need caching — use use*Query; if SSR — useFetch.
export function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  const { $api } = useNuxtApp()
  return $api<T>(url, opts)
}
```

```ts
// app/repositories/useItemsRepository.ts — resource data access (read + write)
// The app/repositories directory must be added to imports.dirs (auto-import), e.g.:
//   imports: { dirs: ['repositories'] }   // path relative to srcDir (app/)
// Method convention: `*Query()` → cached (queryOptions, TanStack);
// plain verbs (getAll/create) → raw/one-off calls and mutations.
import { queryOptions } from '@tanstack/vue-query'
export function useItemsRepository() {
  const getAll = () => useApi('/items')
  return {
    getAll,                                    // one-off read (useApi), no cache
    listQuery: () => queryOptions({            // cached read for use*Query (SSR or client)
      queryKey: ['items'],
      queryFn: getAll,
      refetchInterval: API_CONFIG.pollingInterval,
    }),
    create: (body) => useApi('/items', { method: 'POST', body }), // mutation (useApiMutation)
  }
}
```

**Selection matrix:**

| Need | Composable | Cache | SSR |
|---|---|---|---|
| SSR page with cache | `useServerQuery` | ✅ | ✅ |
| SPA admin panel with cache | `useClientQuery` | ✅ | ❌ |
| Changing data on the backend | `useApiMutation` | — | ❌ |
| One-off data without cache (just a request) | `useApi` / native `useFetch` | ❌ | opt. |

---

## 6. Per-route rendering (`routeRules`)

Base template — adjust the routes per project.

```ts
// nuxt.config.ts (excerpt)
routeRules: {
  '/':          { prerender: true },   // static landing page (SSG)
  '/blog/**':   { swr: 3600 },         // ISR/SWR cache for 1 hour
  '/app/**':    { ssr: false },        // private SPA admin panel + TanStack
  '/api/**':    { cors: true },
},
```

Rule of thumb: public content → `prerender`/`swr` + native fetch + SEO; private admin panel → `ssr: false` + TanStack.

---

## 7. SEO defaults

```ts
// nuxt.config.ts (excerpt)
app: {
  head: {
    htmlAttrs: { lang: 'uk' },
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
  },
},
modules: ['@nuxtjs/sitemap', '@nuxtjs/robots'],
```

On public pages — `useSeoMeta({ title, description, ogTitle, ogDescription })`. For private ones — `robots: false` in `routeRules`.

---

## 8. i18n (if multilingual support is needed)

```ts
modules: ['@nuxtjs/i18n'],
i18n: {
  strategy: 'prefix_except_default',   // /en/..., default locale without prefix
  defaultLocale: 'uk',
  locales: [
    { code: 'uk', language: 'uk-UA', file: 'uk.json' },
    { code: 'en', language: 'en-US', file: 'en.json' },
  ],
  // hreflang is generated automatically
},
```

---

## 9. Nitro / build

```ts
// nuxt.config.ts (excerpt)
nitro: {
  compressPublicAssets: true,
  routeRules: {},          // server-side cache rules if needed
},
experimental: {
  payloadExtraction: true, // smaller payloads when prerendering
},
```

---

## 10. Quality tooling (base set)

- **TypeScript** strict (`tsconfig` extends `./.nuxt/tsconfig.json`).
- **ESLint** — `@nuxt/eslint`.
- **Prettier** — formatting.
- **Husky + lint-staged** — pre-commit lint/format.
- **Vitest** + `@nuxt/test-utils` — unit/component tests.

```jsonc
// package.json (scripts)
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "lint": "eslint .",
    "test": "vitest"
  }
}
```

---

## 11. Checklist for spinning up a new project from this base

1. Copy `app/plugins/*`, `app/composables/*`, `app/utils/config.ts`.
2. Fill in `.env` (`NUXT_PUBLIC_API_BASE`, etc.).
3. Adjust `API_CONFIG` for the project (staleTime, polling, timeout).
4. Define `routeRules` for the actual public/private routes.
5. Enable the modules you need (sitemap/robots/i18n) — remove the unused ones.
6. Add domain repositories `app/repositories/use<Domain>Repository.ts` (reads via `queryOptions` + mutations) and register the directory in `imports.dirs`.

---

## Summary

The base provides: a single point of configuration (`API_CONFIG`), an HTTP client with interceptors (`$api`), 4 composable presets, mixed rendering via `routeRules`, SEO/i18n defaults, and quality tooling. For a new project you mostly change `.env`, `API_CONFIG`, and `routeRules` — the rest is reused as is.
