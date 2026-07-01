# Nuxt Migration Guide — AngularJS/React → Nuxt (SSR + кешування)

Інструкція для переписування легасі-системи на Nuxt із поділом на публічний SSR-шар та закриту SPA-адмінку з кешуванням. Призначена для додавання в цільовий репозиторій як довідка для команди.

---

## 0. Контекст: два застосунки в одному

| Застосунок | Стек зараз | Роль | Куди мігрує |
|---|---|---|---|
| `tomaxApp` | AngularJS 1.x (`ng-app="tomaxApp"`) | платформа керування іспитами | Nuxt (SSR + SPA-маршрути) |
| `siredash` | React 19 + zustand, base `/survey` | аналітична панель | Nuxt SPA-маршрути (`/survey/*`) |

Поточний стан даних: **кешування немає** — усі `$cacheFactory`/`cache:true` тільки у вендорних бібліотеках. `$http` викликається ~981 раз, `$resource` у ~98 файлах, кожен контролер фетчить незалежно. Полінг реалізований через `$interval` (Chat, ExamParticipants, ExamsTable).

**Мета міграції — не паритет, а покращення:** додати кеш-шар для UX і коректний SSR для публічних потоків.

---

## 1. Головний принцип: кеш ≠ SEO

Це різні осі, їх не можна змішувати:

- **SEO/рендер** дає серверний HTML із контентом і мета-тегами (нативні `useAsyncData`/`useFetch` + `useSeoMeta`).
- **Кеш** (TanStack Query) керує даними на клієнті *після* гідрації — швидкість і плавність, **не** пошук.

Правило: SEO-контент → server-render через native fetch; UX-інтерактив → TanStack. Ніколи не віддавай SEO-важливий контент лише через клієнтський `useQuery` — у первинному HTML його не буде.

---

## 2. Стратегія рендерингу per-route (`routeRules`)

Один Nuxt, різні режими на різних маршрутах.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // дефолт
  routeRules: {
    '/accessibility/**': { prerender: true },            // SSG, індексується
    '/login/**':         { ssr: true,  robots: false },  // SSR, noindex
    '/exam/**':          { ssr: true,  robots: false },  // etest — SSR учаснику, noindex
    '/admin/**':         { ssr: false },                 // SPA + TanStack
    '/bank/**':          { ssr: false },
    '/users/**':         { ssr: false },
    '/survey/**':        { ssr: false },                 // siredash-аналітика
  },
})
```

---

## 3. Поділ по сторінках

### 3.1 Публічний шар → SSR/SSG + native fetch (без TanStack)

| Сторінка / маршрут | Auth | Рендер | Дані | SEO |
|---|---|---|---|---|
| `accessibility-statement` (eng/heb) | ні | **SSG** | нема | ✅ index + hreflang |
| `tomax_login` / `tomax_ldap_login` | ні | **SSR** | `$fetch` на submit | `noindex` |
| `tomax_otp`, `tomax_user_role`, `password-recovery*` | ні | **SSR** | `$fetch` | `noindex` |
| `etest_frame` `/etest/{id}`, `exam_file_preview` | токен/лінк | **SSR** | native `useAsyncData` по токену | `noindex` |

`etest` (проходження іспиту) — єдиний масовий end-user потік, SSR критичний для швидкого й доступного першого екрана. TanStack тут не потрібен.

### 3.2 Закрита адмінка → SPA (`ssr: false`) + TanStack кеш

| Маршрут | Що це | Підхід до даних |
|---|---|---|
| `main.exam_manager` `/exam-manager/{id}` | таблиця іспитів | `useClientQuery` + полінг (`refetchInterval`) |
| `main.exam_builder` / `main.exam_redactor` | конструктор/редактор | кеш + оптимістичні мутації |
| `main.grade_frame` `/grade/{id}` | оцінювання | кеш |
| `root.bank_*` (manager/editor/exam/question/block builder) | банк питань | lookup-дані зі `staleTime`, спільні `queryKey` |
| `users`, `users.item` | адмін користувачів | кеш + `invalidateQueries` |
| `siredash` `/survey/*` | аналітика (Dashboard, Trends, Faculty, Reports) | **головний кандидат** — важкі агрегації, фільтри, кеш обов'язковий |

SEO тут нульове (за логіном) → `ssr: false`, TanStack на повну.

---

## 4. Налаштування TanStack Query

### 4.1 Плагін (один раз)

```ts
// plugins/vue-query.ts
import { VueQueryPlugin, QueryClient, hydrate, dehydrate,
         type DehydratedState, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { defineNuxtPlugin, useState } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 }, // проти double-fetch після гідрації
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

### 4.2 Composables (пресети під сценарії)

```ts
// composables/useServerQuery.ts — SSR + кеш (для маршрутів з ssr: true)
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
```

```ts
// composables/useClientQuery.ts — клієнтський кеш (для SPA-адмінки)
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

export function useClientQuery<T>(options: UseQueryOptions<T>) {
  return useQuery({
    ...options,
    enabled: import.meta.client && (options.enabled ?? true),
  })
}
```

```ts
// composables/useApiMutation.ts — команди на бекенд + авто-інвалідація
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
// composables/useApi.ts — ПРОСТО запит: дані без кешу (тонка обгортка над $fetch)
// Без TanStack, без SSR-payload. Для разових викликів. Потрібен кеш → use*Query; SSR → useFetch.
export function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  return $fetch<T>(url, opts)
}
```

### 4.3 Query-функції

```ts
// composables/queries.ts
import { queryOptions } from '@tanstack/vue-query'

export const examsQuery = () => queryOptions({
  queryKey: ['exams'],
  queryFn: () => $fetch('/api/exams'),
  refetchInterval: 15_000, // замість $interval у ExamsTable
})

export const statusesQuery = () => queryOptions({
  queryKey: ['bank', 'statuses'],
  queryFn: () => $fetch('/bank/status'),
  staleTime: Infinity, // lookup-дані: одна вибірка на сесію (було $resource у кожній модалці)
})
```

### 4.4 Використання

```vue
<script setup lang="ts">
// адмінка (SPA)
const { data: exams } = useClientQuery(examsQuery())

const { mutate: changeStatus } = useApiMutation({
  mutationFn: (body) => $fetch('/bank/change-status', { method: 'POST', body }),
  invalidate: [['exams']],
})
</script>
```

**Правило вибору composable:** SSR-сторінка з кешем → `useServerQuery`; SPA-адмінка → `useClientQuery`; зміна даних → `useApiMutation`; разовий запит без кешу (просто запит) → `useApi` (або native `useFetch` якщо потрібен SSR без кешу).

---

## 5. SEO (тільки публічний шар)

```vue
<script setup lang="ts">
// напр. accessibility-statement
useSeoMeta({
  title: 'Заява про доступність',
  description: '...',
  ogTitle: '...',
  ogDescription: '...',
})
</script>
```

- Модулі: `@nuxtjs/sitemap`, `@nuxtjs/robots`.
- Мультимовність (HEB/ENG/RUS): `@nuxtjs/i18n` з `hreflang` і локальними URL.
- `robots: false` у `routeRules` для login/exam — публічні, але не для індексації.

---

## 6. GEO (Generative Engine Optimization) — відкладено

Наразі публічного контентного шару (лендинг, блог, публічні результати) немає, тож GEO **немає на чому застосовувати**. Єдине, що індексується, — статичні accessibility-сторінки, і їм досить SSG + коректних мета.

Повернутися до GEO, коли з'явиться публічний контент. Тоді, поверх того ж SSR: structured data (schema.org / JSON-LD), семантично чистий server-rendered HTML (AI-краулери погано виконують JS), за потреби `llms.txt`. Окремої «GEO-архітектури» не існує — це якісний SEO + структуровані дані.

---

## 7. Порядок міграції (рекомендований)

1. Каркас Nuxt + `routeRules` + плагін `vue-query.ts` + 4 composables.
2. Публічний шар (найпростіший, найбільша цінність для end-user): accessibility → login-flow → `etest` (проходження іспиту, SSR).
3. Адмінка модулями, від простого до складного: `users` → `exam_manager` → `bank_*` → `exam_builder`/`redactor`.
4. Аналітика `siredash` `/survey/*` — портувати як SPA-розділ з TanStack (тут кеш дає найбільше).
5. Замінити всі `$interval`-полінги на `refetchInterval`; усі `$http.post` → `useApiMutation` з `invalidate`.

---

## Резюме

- **Кеш і SEO — різні задачі.** Не розв'язуй SEO кешем.
- **Публічні потоки** (accessibility, login, etest) → SSR/SSG + native fetch + мета.
- **Закрита адмінка й аналітика** → SPA (`ssr: false`) + TanStack кеш.
- **GEO** відкласти до появи публічного контенту.
- Один Nuxt, два режими через `routeRules`.
