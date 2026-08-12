# API composables — what is possible when

The idea: instead of remembering `onServerPrefetch`, `staleTime`, cache or its absence every time — encapsulate each scenario in its own composable. Below are 4 cases: **for which of them this is actually possible and makes sense**, and where the composable degenerates into a thin wrapper.

Prerequisite for all Query variants: the `plugins/vue-query.ts` plugin set up once (dehydrate/hydrate + default `staleTime`). Without it, SSR caching does not work.

---

## Summary table

| # | Scenario | Composable | Cache | Runs on the server | Implemented as |
|---|----------|-----------|-----|------------------------|-------------------|
| 1 | SSR request with caching | `useServerQuery` | ✅ | ✅ (prefetch into payload) | `useQuery` + `onServerPrefetch` |
| 2 | Client-side request with caching | `useClientQuery` | ✅ | ❌ | `useQuery` without prefetch |
| 3 | Command to the backend without data | `useApiMutation` | — (nothing to cache) | ❌ | `useMutation` |
| 4 | Request returns data but no cache (plain request) | `useApi` | ❌ | optional | bare `$fetch` |

Conclusion up front: **cases 1–3 are full-fledged, self-sufficient composables. Case 4 is possible, but it is effectively `$fetch`; TanStack Query is not needed here, because `useQuery` always caches.**

---

## Case 1 — SSR + cache (`useServerQuery`) ✅ fully possible

The main scenario. Data is fetched on the server, serialized into the payload, and taken from the cache on the client without a repeated network request.

```ts
// composables/useServerQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

export function useServerQuery<T>(options: UseQueryOptions<T>) {
  const query = useQuery(options)
  // run the request on the server BEFORE render → it ends up in dehydrate
  onServerPrefetch(() => query.suspense().catch(() => {}))
  return query
}
```

Why it is possible: `onServerPrefetch` + `suspense()` force the request to complete on the server; the plugin dehydrates the result; `staleTime > 0` keeps the client from refetching right after hydration.

Usage:
```ts
const { data, isPending } = useServerQuery(todosQuery())
```

---

## Case 2 — client-side cache (`useClientQuery`) ✅ possible

The request is not needed in the SSR markup (e.g. data behind a login, a widget after mount), but we want cache, retries, `invalidateQueries`.

```ts
// composables/useClientQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

export function useClientQuery<T>(options: UseQueryOptions<T>) {
  // no onServerPrefetch → the request will not run on the server.
  // enabled on the client guarantees queryFn is not called during SSR
  return useQuery({
    ...options,
    enabled: import.meta.client && (options.enabled ?? true),
  })
}
```

Why it is possible: the absence of `onServerPrefetch` already means "do not fetch on the server", and `enabled: import.meta.client` is a safeguard in case `queryFn` must not run on the server at all. The cache is fully functional, it is just populated on the client.

---

## Case 3 — command without data (`useApiMutation`) ✅ possible

POST/PUT/PATCH/DELETE — we change something, the response data is not cached (and often not used). Caching is conceptually not applicable here; instead — `isPending`/`isError` statuses and `invalidateQueries` after success.

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

Usage:
```ts
const { mutate, isPending } = useApiMutation({
  mutationFn: (body) => $fetch('/api/todos', { method: 'POST', body }),
  invalidate: [['todos']], // automatically refresh the list after creation
})
```

Why it is possible: mutations are always client-side, no cache is needed — the composable provides unified error handling and invalidation.

---

## Case 4 — data without cache (`useApi`) ⚠️ possible, but it is just `$fetch`

A one-off request whose result does not need to be kept in the cache (a one-time check, an export, a utility call). `useQuery` **does not fit** here — it always caches. The right tool is `$fetch`, and the composable ends up thin:

```ts
// composables/useApi.ts
// ⚠️ PLAIN request — no cache, no TanStack, no SSR payload. For one-off calls.
export function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  return $fetch<T>(url, opts) // no cache, returns Promise<T>
}
```

Why it is "degenerate": the whole point of TanStack Query is the cache. If the cache is not needed, a wrapper over `$fetch` adds nothing but typing. Therefore:

- only data without cache is needed, **on the client** → `useApi` / direct `$fetch`;
- data without the TanStack cache is needed, but **with SSR payload transfer** → this is no longer the Query world, but Nuxt's built-in `useFetch` / `useAsyncData`.

---

## "What is possible" summary

- **Possible and worth making a separate composable:** cases 1, 2, 3 — each has its own non-trivial configuration (prefetch, `enabled`, invalidation) that is useful to hide.
- **Possible, but redundant:** case 4 — it is `$fetch`; a separate composable is justified only for a uniform import style. For SSR without cache, use `useFetch`, not TanStack.

So your "3–4 functions" actually break down like this: **3 full-fledged** (`useServerQuery`, `useClientQuery`, `useApiMutation`) + **1 thin** (`useApi` — a plain request), and all four cover the listed scenarios.
