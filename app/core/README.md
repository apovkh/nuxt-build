# app/core — project core

Base utilities, config, and design tokens reused across the whole app.
The structure mirrors Nuxt conventions, so the core can easily be promoted to a separate layer when needed.

## Structure

```
app/core/
├─ nuxt.core.config.ts   # core Nuxt settings (imports/plugins/css/tailwind)
├─ tailwind.config.ts    # pulls colors/typography from tokens/
├─ composables/          # useApi, useApiMutation, useClientQuery, useServerQuery, useForm
├─ plugins/              # api.ts ($fetch client), vue-query.ts (TanStack + SSR)
├─ utils/config.ts       # coreConfig — runtime defaults (staleTime, timeout, polling)
├─ components/           # base UI (empty — add as needed)
├─ tokens/               # SOURCE OF TRUTH: colors.ts, typography.ts, index.ts (Vuetify+Tailwind)
│  ├─ fonts.css, main.css
│  └─ fonts/             # self-hosted .woff2
└─ types/                # shared types + $api typing
```

## Wiring into the root nuxt.config

```ts
// nuxt.config.ts (project root)
import { defu } from 'defu'
import { coreNuxtConfig } from './app/core/nuxt.core.config'

export default defineNuxtConfig(
  defu(
    {
      // project settings
      modules: ['@nuxtjs/tailwindcss'],
      runtimeConfig: {
        public: {
          apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
        },
      },
    },
    coreNuxtConfig, // base — as the second argument; defu deep-merges and concatenates arrays
  ),
)
```

`defu` (ships with Nuxt) merges configs deeply and **concatenates** arrays (`css`, `plugins`,
`components`), so core and project values add up instead of overwriting each other.

## Plugin order

If the core plugins (`api`, `vue-query`) must initialize before the project ones —
put `coreNuxtConfig` as the first argument `defu(coreNuxtConfig, {...})`
or add `enforce: 'pre'` to the plugins.

## Composable cheat sheet

| Need | Composable |
|---|---|
| SSR page with cache | `useServerQuery` |
| SPA admin panel with cache | `useClientQuery` |
| Changing data on the backend | `useApiMutation` |
| One-off data without cache (just a request) | `useApi` |
| Form with validation | `useForm` |
| API error handling (locally) | `useApiError` |

## Error handling — three levels

1. **Transport** (`plugins/api.ts`) — `onResponseError`: 401 → redirect to `/login`.
2. **Globally** (`plugins/vue-query.ts`) — `QueryCache`/`MutationCache` `onError` send
   all query/mutation errors to `handleGlobalApiError` (log + notification). Zero code
   per call. `useApi` is routed there too.
3. **Locally** (`useApiError`) — inline errors in forms/components.

Wiring up the project toast (once):

```ts
import { setApiErrorNotifier } from '~/core/utils/handleApiError'
setApiErrorNotifier((e) => useNuxtApp().$toast.error(e.message))
```

Silence a specific query for the global notifier:

```ts
useClientQuery({ queryKey: ['x'], queryFn, meta: { silent: true } })
```
