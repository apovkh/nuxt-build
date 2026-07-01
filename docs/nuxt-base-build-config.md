# Nuxt Base Build — конфігурація та конвенції

Переиспользувана база для нових проектів на Nuxt. Описує налаштування для data-fetching composables **та ширше** — HTTP-клієнт, env, SEO, i18n, структуру, інструменти. Project-agnostic: копіюєш у новий проект і донастроюєш під нього.

---

## 0. Структура проекту

```
project/
├─ nuxt.config.ts
├─ .env / .env.example
├─ app/
│  ├─ composables/
│  │  ├─ useServerQuery.ts     # SSR + кеш
│  │  ├─ useClientQuery.ts     # клієнтський кеш
│  │  ├─ useApiMutation.ts     # мутації + інвалідація
│  │  └─ useApi.ts             # ПРОСТО запит: разовий виклик без кешу (не TanStack)
│  ├─ repositories/            # клієнтський data-access: use<Domain>Repository()
│  │  ├─ useNewsRepository.ts       #   listQuery() → queryOptions (read) + getAll() (raw)
│  │  └─ useBookmarksRepository.ts  #   listQuery() + create() (мутація)
│  ├─ plugins/
│  │  ├─ vue-query.ts          # TanStack init + hydration
│  │  └─ api.ts                # $fetch-інстанс з інтерсепторами
│  ├─ utils/
│  │  └─ config.ts             # єдина точка дефолтів (див. §1)
│  └─ types/
└─ server/
   ├─ api/                     # тонкі Nitro-роути: читають config, делегують
   │  └─ news.get.ts
   └─ repositories/            # серверний data-access: зовнішні API/БД/секрети
      └─ newsRepository.ts     #   (реєструється в nitro.imports.dirs)
```

---

## 1. Єдина точка налаштувань

Щоб база легко тюнилась під кожен проект — усі дефолти в одному місці.

```ts
// app/utils/config.ts
export const API_CONFIG = {
  // HTTP
  baseURL: '',                 // задається через runtimeConfig, див. §3
  timeout: 30_000,
  retry: 1,
  retryDelay: 500,

  // TanStack Query defaults
  query: {
    staleTime: 60_000,         // проти double-fetch після SSR-гідрації
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  },

  // Полінг за замовчуванням для «живих» списків
  pollingInterval: 15_000,
} as const

export type ApiConfig = typeof API_CONFIG
```

Далі всюди імпортуємо `API_CONFIG`, а не хардкодимо числа.

---

## 2. HTTP-клієнт (`$fetch`-інстанс з інтерсепторами)

Базовий клієнт: baseURL, auth-хедери, єдина обробка помилок, refresh/redirect на 401. Використовується і в composables, і напряму.

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
      // сюди ж — централізований лог/тост помилок
    },
  })

  return { provide: { api } } // доступно як useNuxtApp().$api
})
```

У `queryFn`/мутаціях використовуй `useNuxtApp().$api` замість голого `$fetch`, щоб інтерсептори працювали.

---

## 3. Env та runtimeConfig

```ts
// nuxt.config.ts (фрагмент)
runtimeConfig: {
  // приватне (тільки сервер)
  apiSecret: process.env.NUXT_API_SECRET,
  // публічне (клієнт + сервер)
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

Правило: жодних URL/секретів у коді — тільки через `runtimeConfig`.

---

## 4. TanStack Query — плагін і дефолти

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

## 5. Composables — пресети запитів

```ts
// app/composables/useServerQuery.ts — SSR + кеш
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'
export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
```

```ts
// app/composables/useClientQuery.ts — клієнтський кеш
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
export function useClientQuery<T>(options: UseQueryOptions<T>) {
  return useQuery({ ...options, enabled: import.meta.client && (options.enabled ?? true) })
}
```

```ts
// app/composables/useApiMutation.ts — мутації + інвалідація
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
// ⚠️ ПРОСТО ЗАПИТ. Без кешу, без TanStack, без SSR-payload.
// Пряма обгортка над $fetch/$api для разових викликів (експорт, перевірка, службовий виклик).
// Повертає Promise<T>. Якщо потрібен кеш — бери use*Query; якщо SSR — useFetch.
export function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  const { $api } = useNuxtApp()
  return $api<T>(url, opts)
}
```

```ts
// app/repositories/useItemsRepository.ts — data-access ресурсу (read + write)
// Теку app/repositories треба додати в imports.dirs (auto-import), напр.:
//   imports: { dirs: ['repositories'] }   // шлях відносно srcDir (app/)
// Конвенція методів: `*Query()` → кешовані (queryOptions, TanStack);
// прості дієслова (getAll/create) → сирі/разові виклики та мутації.
import { queryOptions } from '@tanstack/vue-query'
export function useItemsRepository() {
  const getAll = () => useApi('/items')
  return {
    getAll,                                    // разовий read (useApi), без кешу
    listQuery: () => queryOptions({            // кешований read для use*Query (SSR або клієнт)
      queryKey: ['items'],
      queryFn: getAll,
      refetchInterval: API_CONFIG.pollingInterval,
    }),
    create: (body) => useApi('/items', { method: 'POST', body }), // мутація (useApiMutation)
  }
}
```

**Матриця вибору:**

| Потреба | Composable | Кеш | SSR |
|---|---|---|---|
| SSR-сторінка з кешем | `useServerQuery` | ✅ | ✅ |
| SPA-адмінка з кешем | `useClientQuery` | ✅ | ❌ |
| Зміна даних на бекенді | `useApiMutation` | — | ❌ |
| Разові дані без кешу (просто запит) | `useApi` / native `useFetch` | ❌ | опц. |

---

## 6. Рендеринг per-route (`routeRules`)

Базовий шаблон — під кожен проект коригуєш маршрути.

```ts
// nuxt.config.ts (фрагмент)
routeRules: {
  '/':          { prerender: true },   // статичний лендинг (SSG)
  '/blog/**':   { swr: 3600 },         // ISR/SWR-кеш на 1 год
  '/app/**':    { ssr: false },        // приватна SPA-адмінка + TanStack
  '/api/**':    { cors: true },
},
```

Орієнтир: публічний контент → `prerender`/`swr` + native fetch + SEO; приватна адмінка → `ssr: false` + TanStack.

---

## 7. SEO-дефолти

```ts
// nuxt.config.ts (фрагмент)
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

На публічних сторінках — `useSeoMeta({ title, description, ogTitle, ogDescription })`. Для приватних — `robots: false` у `routeRules`.

---

## 8. i18n (за потреби мультимовності)

```ts
modules: ['@nuxtjs/i18n'],
i18n: {
  strategy: 'prefix_except_default',   // /en/..., дефолтна без префікса
  defaultLocale: 'uk',
  locales: [
    { code: 'uk', language: 'uk-UA', file: 'uk.json' },
    { code: 'en', language: 'en-US', file: 'en.json' },
  ],
  // hreflang генерується автоматично
},
```

---

## 9. Nitro / build

```ts
// nuxt.config.ts (фрагмент)
nitro: {
  compressPublicAssets: true,
  routeRules: {},          // серверні правила кешу за потреби
},
experimental: {
  payloadExtraction: true, // менші payload при prerender
},
```

---

## 10. Інструменти якості (баз. набір)

- **TypeScript** strict (`tsconfig` extends `./.nuxt/tsconfig.json`).
- **ESLint** — `@nuxt/eslint`.
- **Prettier** — форматування.
- **Husky + lint-staged** — pre-commit lint/format.
- **Vitest** + `@nuxt/test-utils` — юніт/компонентні тести.

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

## 11. Чекліст піднімання нового проекту з цієї бази

1. Скопіювати `app/plugins/*`, `app/composables/*`, `app/utils/config.ts`.
2. Заповнити `.env` (`NUXT_PUBLIC_API_BASE` тощо).
3. Підкоригувати `API_CONFIG` під проект (staleTime, polling, timeout).
4. Прописати `routeRules` під реальні публічні/приватні маршрути.
5. Підключити потрібні модулі (sitemap/robots/i18n) — зайві прибрати.
6. Додати доменні репозиторії `app/repositories/use<Domain>Repository.ts` (read через `queryOptions` + мутації) і зареєструвати теку в `imports.dirs`.

---

## Резюме

База дає: єдину точку налаштувань (`API_CONFIG`), HTTP-клієнт з інтерсепторами (`$api`), 4 пресети composables, змішаний рендеринг через `routeRules`, SEO/i18n-дефолти та інструменти якості. Під новий проект міняються переважно `.env`, `API_CONFIG` і `routeRules` — решта переиспользується як є.
