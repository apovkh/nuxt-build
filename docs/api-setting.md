# API composables — коли що можливо

Ідея: замість того щоб кожного разу пам'ятати про `onServerPrefetch`, `staleTime`, кеш чи його відсутність — інкапсулюємо кожен сценарій у власний composable. Нижче 4 випадки: **для яких з них це реально можливо і має сенс**, а де composable вироджується в тонку обгортку.

Передумова для всіх Query-варіантів: один раз налаштований плагін `plugins/vue-query.ts` (dehydrate/hydrate + дефолтний `staleTime`). Без нього SSR-кешування не працює.

---

## Зведена таблиця

| # | Сценарій | Composable | Кеш | Виконується на сервері | Реалізовується як |
|---|----------|-----------|-----|------------------------|-------------------|
| 1 | SSR-запит з кешуванням | `useServerQuery` | ✅ | ✅ (prefetch у payload) | `useQuery` + `onServerPrefetch` |
| 2 | Клієнтський запит з кешуванням | `useClientQuery` | ✅ | ❌ | `useQuery` без prefetch |
| 3 | Команда на бекенд без даних | `useApiMutation` | — (нема що кешувати) | ❌ | `useMutation` |
| 4 | Запит повертає дані, але без кешу (просто запит) | `useApi` | ❌ | за бажанням | голий `$fetch` |

Висновок наперед: **випадки 1–3 — повноцінні, самодостатні composables. Випадок 4 — можливий, але це фактично `$fetch`; TanStack Query тут не потрібен, бо `useQuery` завжди кешує.**

---

## Випадок 1 — SSR + кеш (`useServerQuery`) ✅ повністю можливо

Головний сценарій. Дані фетчаться на сервері, серіалізуються в payload, на клієнті беруться з кешу без повторного мережевого запиту.

```ts
// composables/useServerQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  // виконати запит на сервері ДО рендера → потрапить у dehydrate
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
```

Чому можливо: `onServerPrefetch` + `suspense()` змушують запит завершитися на сервері; плагін dehydrate'ить результат; `staleTime > 0` не дає клієнту рефетчити одразу після гідрації.

Використання:
```ts
const { data, isPending } = useServerQuery(todosQuery())
```

---

## Випадок 2 — клієнтський кеш (`useClientQuery`) ✅ можливо

Запит не потрібен у SSR-розмітці (наприклад, дані під логіном, віджет після mount), але хочемо кеш, ретраї, `invalidateQueries`.

```ts
// composables/useClientQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

export function useClientQuery<T>(options: UseQueryOptions<T>) {
  // без onServerPrefetch → на сервері запит не піде.
  // enabled на клієнті гарантує, що queryFn не викличеться під час SSR
  return useQuery({
    ...options,
    enabled: import.meta.client && (options.enabled ?? true),
  })
}
```

Чому можливо: відсутність `onServerPrefetch` вже означає «не фетчити на сервері», а `enabled: import.meta.client` — страховка, якщо `queryFn` не можна виконувати на сервері взагалі. Кеш повноцінний, просто заповнюється на клієнті.

---

## Випадок 3 — команда без даних (`useApiMutation`) ✅ можливо

POST/PUT/PATCH/DELETE — щось змінюємо, відповідь-дані не кешуємо (і часто не використовуємо). Кешування тут концептуально не застосовне; натомість — статуси `isPending`/`isError` і `invalidateQueries` після успіху.

```ts
// composables/useApiMutation.ts
import { useMutation, useQueryClient,
         type UseMutationOptions } from '@tanstack/vue-query'

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

Використання:
```ts
const { mutate, isPending } = useApiMutation({
  mutationFn: (body) => $fetch('/api/todos', { method: 'POST', body }),
  invalidate: [['todos']], // автоматично оновити список після створення
})
```

Чому можливо: мутації завжди клієнтські, кеш не потрібен — composable дає уніфіковану обробку помилок і інвалідацію.

---

## Випадок 4 — дані без кешу (`useApi`) ⚠️ можливо, але це просто `$fetch`

Разовий запит, результат якого не треба тримати в кеші (одноразова перевірка, експорт, службовий виклик). Тут `useQuery` **не підходить** — він завжди кешує. Правильний інструмент — `$fetch`, а composable виходить тонким:

```ts
// composables/useApi.ts
// ⚠️ ПРОСТО запит — без кешу, без TanStack, без SSR-payload. Для разових викликів.
export function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  return $fetch<T>(url, opts) // без кешу, повертає Promise<T>
}
```

Чому «вироджений»: сенс TanStack Query — саме кеш. Якщо кеш не потрібен, обгортка над `$fetch` не додає нічого, крім типізації. Тому:

- потрібні лише дані без кешу, **на клієнті** → `useApi` / прямий `$fetch`;
- потрібні дані без TanStack-кешу, але **з SSR-payload transfer** → це вже не Query-світ, а вбудований `useFetch` / `useAsyncData` Nuxt.

---

## Підсумок «що можливо»

- **Можливо і варто робити окремим composable:** випадки 1, 2, 3 — у кожного своя нетривіальна конфігурація (prefetch, `enabled`, invalidation), яку корисно сховати.
- **Можливо, але зайве:** випадок 4 — це `$fetch`; окремий composable виправданий хіба заради єдиного стилю імпортів. Для SSR без кешу бери `useFetch`, а не TanStack.

Тобто твої «3–4 функції» реально складаються так: **3 повноцінні** (`useServerQuery`, `useClientQuery`, `useApiMutation`) + **1 тонка** (`useApi` — просто запит), і всі чотири покривають перелічені сценарії.
