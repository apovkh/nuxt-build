# SSR vs Client — what, when, and which tool to use

A guide for a first-time reader. Explains how Nuxt renders on the server
(SSR) and on the client (CSR), when to pick which, and **exactly which composables/components
of this project** to use for it. Tied to real files in `app/`.

---

## 0. Three concepts in 30 seconds

- **SSR (Server-Side Rendering)** — Nuxt runs your Vue component **on the server**,
  returns ready-made HTML (with data inside), and the browser shows the page immediately.
- **CSR (Client-Side Rendering)** — the server returns nearly empty HTML, and the content
  is drawn by JavaScript **in the browser**. The user first sees a blank screen/loader.
- **Hydration** — after SSR the browser loads the JS and "brings to life" the existing
  HTML: Vue attaches to the ready markup, restores state from the payload, and makes the
  page interactive. It does **not** re-fetch the data (if everything is set up correctly).

```
SSR request:
  browser → server runs the component → HTML with data + payload (__NUXT_DATA__)
          → browser shows HTML instantly → JS loads → hydration → interactivity
```

In this project `ssr: true` is enabled **globally** (`nuxt.config.ts`), and individual
pages disable SSR via `routeRules` (e.g. `'/news-spa': { ssr: false }`).

---

## 1. The main question: SSR or Client?

| Pick **SSR (`ssr: true`)** when… | Pick **Client (`ssr: false`)** when… |
|---|---|
| The page is **public** and must be indexed (SEO) | The page is **behind a login** (dashboard, admin) — no SEO needed |
| You need nice social-media previews (OG tags) | Heavy interactivity/dashboard where the first screen is behind a spinner anyway |
| Fast first paint of content matters | Lots of browser APIs (canvas, localStorage, WebSocket) |
| Data is the same for everyone / cacheable | Data is strictly personal and changes constantly |

Rule of thumb: **SSR by default**. Disable it selectively where the content is private
or makes no sense on the server.

---

## 2. How to fetch data — the project's 5 tools

All demos are collected on the home page (`app/pages/index.vue`). Here's when to use what:

### 2.1 `useFetch` / `useAsyncData` — built into Nuxt (the SSR default)
- **What:** SSR fetch + automatic transfer into the payload + hydration. Zero ceremony.
- **When:** a simple SSR page where TanStack caching/invalidation is **not** needed.
- **Example:** `app/pages/index.vue`
  ```ts
  const { data: articles } = await useFetch<Article[]>('/api/news')
  ```
- 👉 If in doubt and you just need data in the HTML — use this.

### 2.2 `useServerQuery` — SSR + TanStack cache (`app/core/composables/useServerQuery.ts`)
- **What:** same as useFetch, but on top of TanStack Query — with cache, staleTime,
  invalidation. Data is computed on the server (`onServerPrefetch`), goes into the HTML and
  the payload; on the client `await suspense()` holds the transition so no loader flashes.
- **When:** a public page (SEO) where you also want caching/invalidation across pages.
- **Example:** `app/pages/news-ssr.vue`
  ```ts
  const { data: articles, error } = await useServerQuery(news.listQuery())
  ```

### 2.3 `useClientQuery` — client-side cache (`app/core/composables/useClientQuery.ts`)
- **What:** a TanStack query **browser-only** (`enabled: import.meta.client`), no
  server prefetch. No data in the HTML — it loads after hydration.
- **When:** pages with `ssr: false` (dashboard/admin) where SEO isn't needed but caching
  is.
- **Example:** `app/pages/news-spa.vue` (+ `routeRules: { '/news-spa': { ssr: false } }`)
  ```ts
  const { data: articles, isPending, error } = useClientQuery(news.listQuery())
  ```

### 2.4 `useApi` — one-off request (`app/core/composables/useApi.ts`)
- **What:** a thin wrapper over `$fetch`. **No cache, no SSR payload.** You manage
  state (pending/error) by hand.
- **When:** an on-demand action — a "Refresh" click, a one-off load that shouldn't be cached.
- **Example:** `app/pages/news-oneoff.vue`

### 2.5 `useApiMutation` — data changes (`app/core/composables/useApiMutation.ts`)
- **What:** mutations (POST/PUT/DELETE) + automatic invalidation of related queries.
- **When:** create/update/delete followed by re-reading the list.
- **Example:** `app/pages/bookmarks.vue`

**Decision cheat sheet:**
```
Need data in the HTML (SEO)? ──no──> useClientQuery (ssr:false) or useApi (one-off)
        │yes
        ▼
Need TanStack cache/invalidation? ──no──> useFetch / useAsyncData
        │yes
        ▼
   useServerQuery

Changing data (not reading)? ──> useApiMutation
```

---

## 3. About `<Suspense>`, `onServerPrefetch`, and `await` (how it works)

- **You do NOT need to write `<Suspense>` by hand.** Nuxt already wraps the page: `app/app.vue`
  is `<NuxtLayout><NuxtPage/></NuxtLayout>`, and `<NuxtPage>` creates a
  Suspense boundary inside. So a **top-level `await` in `<script setup>`** (our
  `await useServerQuery(...)`, `await useFetch(...)`) blocks the page render until
  the data is ready — both on the server and on in-app navigation.
- **`onServerPrefetch`** (a Vue hook) — so async work finishes **on the server** and
  lands in the payload. Used inside `useServerQuery`.
- **A manual `<Suspense>`** only makes sense for a **nested** async boundary: when an async
  child component should show its own fallback without blocking the whole page.

---

## 4. Styles (CSS) and fonts with SSR — when it flashes and how to fix it

A common question: "do I need to do anything for styles to arrive right away with SSR?".
In short — **in production, no: styles are already in `<head>` before first paint**. The flash
of unstyled content (FOUC) you sometimes see is almost always `nuxt dev`.

### 4.1 Why it flashes in `dev` but not in production
Nuxt resolves `features.inlineStyles` like this (simplified, `@nuxt/schema` 4.x):
- **`nuxt dev`** → `inlineStyles` is forced to `false`. Vite serves CSS through JS and inserts
  `<style>` **after** hydration → hence the FOUC. Dev only.
- **`nuxt build` (ssr:true)** → default `id => id.includes('.vue')`: component styles
  are **inlined into the HTML**.

### 4.2 What goes into the HTML in production

| Source | Delivery with SSR | Ready when |
|---|---|---|
| Global CSS — `~/core/tokens/main.css` + Tailwind | **inline** `<style>` in `<head>` | with the HTML, 0 extra requests |
| `.vue` component styles (`<style scoped>`) | **inline** `<style>` in `<head>` | with the HTML |

Here `features.inlineStyles: true` (§4.3) — so there is no separate `<link rel="stylesheet">`,
styles arrive in the document itself. The browser paints right after parsing the HTML, without a
render-blocking round-trip for CSS. **No FOUC in production.**

> Verified on a production build: `<head>` has one `<style>` (the entire project CSS, ~2.86 KB gzip)
> and a `<link rel="preload" as="font">`, while `<link rel="stylesheet">` is **absent**.

### 4.3 How it's enabled: `inlineStyles: true`
The project inlines all CSS into the HTML:
```ts
// nuxt.config.ts
features: { inlineStyles: true }
```
**Why this is justified here:** the built CSS is tiny — **~11.6 KB (2.86 KB gzip)**. Inlining
saves a render-blocking round-trip on first paint (the browser doesn't fetch a separate `.css`),
and the downside — CSS not being cached separately across pages — is negligible at 3 KB.

**When to disable it (`inlineStyles: false`):** if the CSS grows to tens/hundreds of KB — then
one shared cached `<link>` beats inlining into every response.

### 4.4 Fonts — a separate axis (FOUT, not CSS)
Even with CSS in place, a self-hosted font with `font-display: swap` causes **FOUT**: first
the system font, then a jump to your own — because the `.woff2` is fetched asynchronously. CSS
has nothing to do with it.

How it's done in the project (the font is **Montserrat**, variable):
1. **woff2, not ttf.** The raw Google `.ttf` (~688 KB) was converted to `.woff2` (~214 KB) —
   the variable `wght 100–900` axis stays in a single file:
   `npx --yes ttf2woff2 < in.ttf > out.woff2`.
2. **Public, unhashed path.** Files live in `public/fonts/`
   (`/fonts/Montserrat-Variable.woff2`), not in the bundle — because preload needs a stable
   URL, and the bundle produces a hash.
3. **`@font-face`** in `app/core/tokens/fonts.css` points to that `/fonts/…`;
   `typography.ts` sets `fontFamily` to `Montserrat`.
4. **Guarded preload** in `nuxt.config.ts`:
   ```ts
   const CRITICAL_FONT = 'Montserrat-Variable.woff2'
   const fontPreload = existsSync(fileURLToPath(new URL(`./public/fonts/${CRITICAL_FONT}`, import.meta.url)))
     ? [{ rel: 'preload', as: 'font', type: 'font/woff2', href: `/fonts/${CRITICAL_FONT}`, crossorigin: 'anonymous' }]
     : []
   // ...
   app: { head: { link: [...fontPreload] } },
   ```
   `existsSync` — so the `<link>` is added ONLY when the file actually exists (otherwise 404 +
   "preloaded but not used"). `crossorigin` is mandatory for fonts, otherwise the browser
   fetches the file twice.

> An alternative without the manual path — the `@nuxt/fonts` module (finds `@font-face` itself,
> self-hosts, adds preload). Not wired up at the moment.

### 4.5 How to verify (not on `dev`!)
```bash
npm run build && npm run preview
```
`view-source` of the page → `<head>` has an inline `<style>` (all the CSS — because `inlineStyles:
true`) and a `<link rel="preload" as="font">` (the font), and no separate `<link rel="stylesheet">`.
In `dev`, inlining is disabled (CSS via JS) — which is why you verify on `build`.

---

## 5. What runs only on the client (and how to mark it)

Code that touches browser APIs **crashes on the server** (`window`, `document`,
`localStorage`, `navigator` don't exist there). Guard it like this:

| Tool | Why |
|---|---|
| `<ClientOnly>` | Wrapper around a component that renders **only** in the browser (non-SSR-safe libraries, widgets on `window`). |
| `import.meta.client` / `import.meta.server` | Branching code by environment. Used in `useServerQuery`, `createHttp`, the `vue-query` plugin. |
| `onMounted(() => …)` | Runs only on the client after mount — a safe place for `window`/`document`. |

```vue
<ClientOnly>
  <HeavyBrowserWidget />
  <template #fallback>Loading…</template>
</ClientOnly>
```

---

## 6. What runs only on the server (server components and server code)

Symmetric to §5: some things must live **only on the server** — secrets, API
keys, DB access, heavy dependencies you don't want in the client bundle.

### 6.1 Server components (Nuxt Server Components / islands)
- **What:** a component rendered **only on the server** that ships ready HTML with **no
  JS** in the client bundle. The opposite of `<ClientOnly>`.
- **When:** heavy/static content (Markdown rendering, code highlighting, big
  dependencies) that needs no client interactivity → smaller JS bundle.
- **How:** an experimental feature — enabled with `experimental: { componentIslands: true }`
  in `nuxt.config`. Then a component with the `Name.server.vue` suffix or `<NuxtIsland>`.
  Interactive inserts inside an island — via `nuxt-client` (a separate setting).
- **Status in the project:** currently **not** enabled (no need). This is optional.

| Component type | Renders | JS on the client | When |
|---|---|---|---|
| Regular | server + client (hydration) | yes | default, has interactivity |
| `<ClientOnly>` | client only | yes | browser APIs |
| Server (`*.server.vue`) | server only | no | static content, heavy dependencies, no interactivity |

### 6.2 Server code — the `server/` directory (Nitro)
This is where the app's **backend** lives. In this project — `server/api` + `server/repositories`.

| Folder | What | In the project |
|---|---|---|
| `server/api/*` | HTTP endpoints (`defineEventHandler`) | `news.get.ts`, `bookmarks.get/post.ts` |
| `server/repositories/*` | server data access: external APIs, DB, **secrets** | `newsRepository.ts` (newsdata.io key), `bookmarksRepository.ts` |
| `server/routes/*` | non-`/api` routes (e.g. `/sitemap.xml`) | — |
| `server/middleware/*` | code on **every** request (auth, headers) | — |
| `server/plugins/*` | Nitro lifecycle hooks | — |
| `server/utils/*` | auto-imported server helpers | — |

### 6.3 Server utilities you'll need
- **`useRuntimeConfig(event)`** — read private config/secrets (server only);
  e.g. `server/api/news.get.ts` reads `newsApiKey`.
- **`createError({ statusCode, statusMessage })`** — throw an HTTP error from a route.
- **`defineCachedEventHandler` / `routeRules`** (`swr`, `isr`, `cache`) — server-side
  response caching.
- **`import.meta.server`** — server-only code branch (used in `useServerQuery`, the
  `vue-query` plugin).

**The main rule:** anything containing a **secret** (API key, token, DB access) must
live on the server. That's exactly why the newsdata.io key lives in
`server/repositories/newsRepository.ts`, and the page reaches it through its own
`/api/news` route, not directly.

---

## 7. Common SSR pitfalls

1. **Hydration mismatch** — the server HTML must match the first client render.
   Broken by: `Date.now()`, `Math.random()`, branching on `window` during render,
   different locale/timezone. Fix: move it into `<ClientOnly>` or `onMounted`.
2. **"Loading…" flash on navigation** — when the request starts only in the browser. For an SSR
   page the fix is `await` in setup (see §3), as done in `news-ssr.vue`.
3. **Image jumps (CLS)** — `<NuxtImg>` without a reserved height pushes content
   when the image finishes loading. Set a fixed box: `width` + `height` **and**
   `h-/w-` classes (because Tailwind preflight sets `img{height:auto}` and overrides the attribute),
   plus `object-cover`. Example — `news-ssr.vue`.
4. **`window is not defined`** — accessing a browser API at top-level setup.
   Wrap it in `import.meta.client` / `onMounted`.
5. **A parent `v-if` depends on state written by a child** — during SSR the parent (layout)
   resolves the `v-if` **before** the child page manages to populate `useState`. So SSR
   renders one branch and the client (state already in the payload) renders another → hydration mismatch and a layout
   jump. This is exactly what happened with `usePageCode` + the grid in `default.vue`. Fix: gate the
   structural `v-if` on **`route.meta`** (`definePageMeta`), not on state from the child —
   meta is available before render and identical SSR↔client. Example: `hasCode: true` in pages +
   `computed(() => Boolean(route.meta.hasCode))` in the layout.

---

## 8. Where to look in the code

| I want to see… | File |
|---|---|
| All examples on one page | `app/pages/index.vue` |
| SSR + cache | `app/pages/news-ssr.vue` + `app/core/composables/useServerQuery.ts` |
| Client-only + cache | `app/pages/news-spa.vue` + `app/core/composables/useClientQuery.ts` |
| One-off request | `app/pages/news-oneoff.vue` + `app/core/composables/useApi.ts` |
| Mutation + invalidation | `app/pages/bookmarks.vue` + `app/core/composables/useApiMutation.ts` |
| TanStack hydration (dehydrate/hydrate) | `app/core/plugins/vue-query.ts` |
| Styles/fonts with SSR (inline + preload) | §4 + `nuxt.config.ts` (`inlineStyles`, `fontPreload`) + `public/fonts/` |
| Server endpoint + secrets | `server/api/news.get.ts` + `server/repositories/newsRepository.ts` |
| Server components (islands) | `experimental.componentIslands` in `nuxt.config` (optional) |
| Disable SSR on a route | `nuxt.config.ts` → `routeRules` |

---

## TL;DR

- Default to **SSR**; disable it selectively for private/heavily interactive pages.
- Just need data in the HTML → **`useFetch`**. Also need cache/invalidation → **`useServerQuery`**.
- Client-only page (ssr:false) → **`useClientQuery`**. One-off → **`useApi`**. Changes → **`useApiMutation`**.
- Nuxt provides `<Suspense>` — just put `await` in setup. Browser-only code → `<ClientOnly>` / `onMounted` / `import.meta.client`.
- Styles with SSR are inlined into the HTML (`features.inlineStyles: true`), so they arrive with the document (FOUC happens only in `dev`). Fonts → `preload` a woff2 from the stable `public/fonts/` against FOUT.
- Secrets/keys/DB/heavy dependencies → **server**: `server/api` + `server/repositories`, and server components (`*.server.vue`) if needed.
