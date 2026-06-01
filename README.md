# nuxt-build

Reusable Nuxt 4 SPA starter — preconfigured build, theming, forms, linting and tooling to bootstrap new projects.

## Stack

- **Nuxt 4** (SPA / `ssr: false`) + **Vue 3** + **vue-router**
- **Vuetify 4** via `vuetify-nuxt-module` (theme & colors in `vuetify.config.ts`)
- **Tailwind CSS 4** (design tokens in `app/scss/tailwind.css`, synced with the Vuetify theme)
- **Pinia** setup stores · **TanStack Query** (`@tanstack/vue-query`) · **vue-i18n**
- **ESLint** flat config (`@antfu/eslint-config` + module-boundary rules)
- **Vitest** + `@nuxt/test-utils` + `happy-dom`

## Setup

```bash
yarn install
cp .env.example .env
yarn dev
```

Dev server runs on http://localhost:3001.

## Scripts

- `dev` / `dev:local` — start dev server (`dev:local` points the API at `localhost:8080`)
- `build` — `nuxt generate` → static SPA in `.output/public`
- `preview` / `start` — preview the built output
- `test` / `test:watch` / `test:coverage` — Vitest
- `lint` / `lint:fix` — ESLint
- `schema` — generate `app/shared/types/schema.ts` from `openapi.yaml`
- `docs` — generate API docs from `app/` into `docs/`

## Project layout

```
app/
  app.vue              # NuxtLayout > NuxtPage
  error.vue            # error boundary
  layouts/             # default layout (mounts ANotify + ADialogHost)
  pages/               # routes
  plugins/             # vue-query client
  stores/              # Pinia setup stores (auto-imported)
  locales/             # i18n messages
  scss/                # tailwind tokens + vuetify globals
  domains/             # feature domains (DDD-style; empty in the starter)
  shared/
    api/               # ofetch client (useApi)
    composables/       # useNotify, useDialog, useConfirm, ...
    form/              # useForm, useVForm, validation rules
    ui/                # A-prefix Vuetify wrappers (auto-imported)
    types/             # shared types + generated schema
```

## Conventions

- **A-prefix UI wrappers** (`ATextField`, `ADialog`, `AValidation`, ...) over Vuetify, auto-imported from `app/shared/ui`.
- **Pinia setup stores** (`defineStore('name', () => { ... })`), auto-imported.
- **TanStack Query** for cached UI data; **direct service calls** for one-shot actions.
- **Module boundaries** enforced by ESLint: `shared/` may not import from `domains/`; domain internals (`services`, `mapping`, `stores`) are private.
- **Path aliases**: `#shared`, `#domains`, `@mapping`, `@schema`, `#tailwind`.
