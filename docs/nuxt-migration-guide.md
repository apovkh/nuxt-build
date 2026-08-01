# Nuxt Migration Guide — AngularJS/React → Nuxt (SSR + кешування)

Інструкція для переписування легасі-системи на Nuxt із поділом на публічний SSR-шар та закриту SPA-адмінку з кешуванням. Призначена для додавання в цільовий репозиторій як довідка для команди.

---

## 0. Контекст: типовий вхід

Гайд розрахований на легасі-систему, де:

- фронт — AngularJS 1.x або рання React-SPA (часто кілька застосунків під одним доменом);
- кешу немає: кожен контролер/компонент фетчить незалежно, а `cache: true` трапляється лише у вендорних бібліотеках;
- запити розсипані по сотнях файлів (`$http`/`$resource`/`fetch` напряму, без транспортного шару);
- полінг зроблений таймерами (`$interval`/`setInterval`) у самих компонентах.

**Мета міграції — не паритет, а покращення:** додати кеш-шар для UX і коректний SSR для публічних потоків.

Перед стартом варто скласти дві таблиці — публічні маршрути (§3.1) і закриті (§3.2); саме вони диктують `routeRules`.

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
    '/session/**':       { ssr: true,  robots: false },  // масовий end-user потік, noindex
    '/admin/**':         { ssr: false },                 // SPA + TanStack
    '/catalog/**':       { ssr: false },
    '/users/**':         { ssr: false },
    '/analytics/**':     { ssr: false },
  },
})
```

---

## 3. Поділ по сторінках

### 3.1 Публічний шар → SSR/SSG + native fetch (без TanStack)

Заповни таблицю під свою систему — по рядку на маршрут:

| Тип сторінки | Auth | Рендер | Дані | SEO |
|---|---|---|---|---|
| Статичний контент (правова інформація, лендинги) | ні | **SSG** (`prerender`) | нема | ✅ index + hreflang |
| Форми входу / відновлення пароля / OTP | ні | **SSR** | `$fetch` на submit | `noindex` |
| Доступ за токеном чи одноразовим лінком | токен | **SSR** | native `useAsyncData` по токену | `noindex` |

Масовий end-user потік (те, заради чого систему відкривають найчастіше) тримай на SSR: перший екран має бути швидким і доступним без JS. TanStack тут не потрібен.

### 3.2 Закрита адмінка → SPA (`ssr: false`) + TanStack кеш

| Тип маршруту | Підхід до даних |
|---|---|
| Табличні списки, що змінюються в реальному часі | `useClientQuery` + полінг (`refetchInterval`) |
| Конструктори/редактори сутностей | кеш + оптимістичні мутації |
| Довідники й lookup-дані | довгий `staleTime`, спільні `queryKey` |
| Адміністрування користувачів і ролей | кеш + `invalidateQueries` після мутацій |
| Аналітика й звіти | **головний кандидат** — важкі агрегації та фільтри, кеш обов'язковий |

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

export const ordersQuery = () => queryOptions({
  queryKey: ['orders'],
  queryFn: () => $fetch('/api/orders'),
  refetchInterval: 15_000, // замість таймера-полінга в самій таблиці
})

export const statusesQuery = () => queryOptions({
  queryKey: ['catalog', 'statuses'],
  queryFn: () => $fetch('/api/catalog/statuses'),
  staleTime: Infinity, // lookup-дані: одна вибірка на сесію (було по запиту в кожній модалці)
})
```

### 4.4 Використання

```vue
<script setup lang="ts">
// адмінка (SPA)
const { data: orders } = useClientQuery(ordersQuery())

const { mutate: changeStatus } = useApiMutation({
  mutationFn: (body) => $fetch('/api/orders/change-status', { method: 'POST', body }),
  invalidate: [['orders']],
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
- Мультимовність: `@nuxtjs/i18n` з `hreflang` і локалізованими URL.
- `robots: false` у `routeRules` для маршрутів, які публічно доступні, але не для індексації (логін, доступ за токеном).

---

## 6. GEO (Generative Engine Optimization) — відкладено

Якщо публічного контентного шару (лендинг, блог, публічні звіти) ще немає, GEO **немає на чому застосовувати**: коли індексуються лише статичні сторінки, їм досить SSG + коректних мета.

Повернутися до GEO, коли з'явиться публічний контент. Тоді, поверх того ж SSR: structured data (schema.org / JSON-LD), семантично чистий server-rendered HTML (AI-краулери погано виконують JS), за потреби `llms.txt`. Окремої «GEO-архітектури» не існує — це якісний SEO + структуровані дані.

---

## 7. Порядок міграції (рекомендований)

1. Каркас Nuxt + `routeRules` + плагін `vue-query.ts` + 4 composables.
2. Публічний шар (найпростіший, найбільша цінність для end-user): статичні сторінки → login-flow → основний end-user потік на SSR.
3. Адмінка модулями, від простого до складного: спершу довідники й керування користувачами, далі списки, наостанок конструктори/редактори.
4. Аналітика — портувати як SPA-розділ з TanStack (тут кеш дає найбільше).
5. Замінити всі таймерні полінги на `refetchInterval`; усі прямі POST-виклики → `useApiMutation` з `invalidate`.

---

## Резюме

- **Кеш і SEO — різні задачі.** Не розв'язуй SEO кешем.
- **Публічні потоки** (статичні сторінки, логін, основний end-user флоу) → SSR/SSG + native fetch + мета.
- **Закрита адмінка й аналітика** → SPA (`ssr: false`) + TanStack кеш.
- **GEO** відкласти до появи публічного контенту.
- Один Nuxt, два режими через `routeRules`.
