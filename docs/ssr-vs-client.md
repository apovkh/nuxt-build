# SSR vs Client — що, коли і чим користуватись

Гайд для того, хто читає це вперше. Пояснює, як у Nuxt працює рендер на сервері
(SSR) і на клієнті (CSR), коли який обирати, і **якими саме composable'ами/компонентами
цього проєкту** це робити. Прив'язано до реальних файлів у `app/`.

---

## 0. Три поняття за 30 секунд

- **SSR (Server-Side Rendering)** — Nuxt виконує твій Vue-компонент **на сервері**,
  віддає готовий HTML (з даними всередині), і браузер одразу показує сторінку.
- **CSR (Client-Side Rendering)** — сервер віддає майже порожній HTML, а вміст
  малює JavaScript **у браузері**. Користувач спершу бачить пусто/лоадер.
- **Hydration (гідрація)** — після SSR браузер завантажує JS і «оживляє» вже наявний
  HTML: Vue чіпляється до готової розмітки, відновлює стан із payload і робить
  сторінку інтерактивною. Даних повторно **не** тягне (якщо все налаштовано правильно).

```
SSR-запит:
  браузер → сервер виконує компонент → HTML з даними + payload (__NUXT_DATA__)
          → браузер миттєво показує HTML → вантажиться JS → hydration → інтерактив
```

У цьому проєкті `ssr: true` увімкнено **глобально** (`nuxt.config.ts`), а окремі
сторінки вимикають SSR через `routeRules` (напр. `'/news-spa': { ssr: false }`).

---

## 1. Головне питання: SSR чи Client?

| Обирай **SSR (`ssr: true`)**, коли… | Обирай **Client (`ssr: false`)**, коли… |
|---|---|
| Сторінка **публічна** і має індексуватись (SEO) | Сторінка **за логіном** (кабінет, адмінка) — SEO не треба |
| Потрібне гарне прев'ю в соцмережах (OG-теги) | Важкий інтерактив/дашборд, де перший екран однаково за спінером |
| Важливий швидкий перший показ контенту | Багато браузерних API (canvas, localStorage, WebSocket) |
| Дані однакові для всіх / кешуються | Дані суто персональні й змінюються щомиті |

Правило великого пальця: **за замовчуванням SSR**. Вимикай його точково там, де
контент приватний або не має сенсу на сервері.

---

## 2. Чим тягнути дані — 5 інструментів проєкту

Усі демо зібрані на головній (`app/pages/index.vue`). Ось коли що:

### 2.1 `useFetch` / `useAsyncData` — вбудований Nuxt (дефолт для SSR)
- **Що:** SSR-фетч + автоматичний перенос у payload + гідрація. Нуль церемоній.
- **Коли:** проста SSR-сторінка, де **не** потрібен кеш/інвалідація TanStack.
- **Приклад:** `app/pages/index.vue`
  ```ts
  const { data: articles } = await useFetch<Article[]>('/api/news')
  ```
- 👉 Якщо сумніваєшся і тобі просто треба дані в HTML — бери це.

### 2.2 `useServerQuery` — SSR + кеш TanStack (`app/core/composables/useServerQuery.ts`)
- **Що:** те саме, що useFetch, але поверх TanStack Query — з кешем, staleTime,
  інвалідацією. Дані рахуються на сервері (`onServerPrefetch`), летять у HTML і в
  payload; на клієнті `await suspense()` тримає перехід, щоб не блимав лоадер.
- **Коли:** публічна сторінка (SEO), де ще й хочеш кеш/інвалідацію між сторінками.
- **Приклад:** `app/pages/news-ssr.vue`
  ```ts
  const { data: articles, error } = await useServerQuery(news.listQuery())
  ```

### 2.3 `useClientQuery` — клієнтський кеш (`app/core/composables/useClientQuery.ts`)
- **Що:** TanStack-запит **лише в браузері** (`enabled: import.meta.client`), без
  серверного префетчу. Даних у HTML немає — вони підвантажуються після гідрації.
- **Коли:** сторінки з `ssr: false` (кабінет/адмінка), де SEO не потрібне, а кеш —
  так.
- **Приклад:** `app/pages/news-spa.vue` (+ `routeRules: { '/news-spa': { ssr: false } }`)
  ```ts
  const { data: articles, isPending, error } = useClientQuery(news.listQuery())
  ```

### 2.4 `useApi` — разовий запит (`app/core/composables/useApi.ts`)
- **Що:** тонка обгортка над `$fetch`. **Без кешу, без SSR-payload.** Стан
  (pending/error) керуєш руками.
- **Коли:** дія на вимогу — клік «Оновити», разове завантаження, яке не треба кешувати.
- **Приклад:** `app/pages/news-oneoff.vue`

### 2.5 `useApiMutation` — зміни даних (`app/core/composables/useApiMutation.ts`)
- **Що:** мутації (POST/PUT/DELETE) + автоматична інвалідація пов'язаних запитів.
- **Коли:** створити/оновити/видалити, після чого перечитати список.
- **Приклад:** `app/pages/bookmarks.vue`

**Шпаргалка вибору:**
```
Треба дані в HTML (SEO)? ──ні──> useClientQuery (ssr:false) або useApi (разово)
        │так
        ▼
Потрібен кеш/інвалідація TanStack? ──ні──> useFetch / useAsyncData
        │так
        ▼
   useServerQuery

Змінюєш дані (не читаєш)? ──> useApiMutation
```

---

## 3. Про `<Suspense>`, `onServerPrefetch` та `await` (як воно працює)

- **`<Suspense>` вручну писати НЕ треба.** Nuxt уже огортає сторінку: `app/app.vue` —
  це `<NuxtLayout><NuxtPage/></NuxtLayout>`, а `<NuxtPage>` всередині створює
  Suspense-межу. Тому **top-level `await` у `<script setup>`** (наш
  `await useServerQuery(...)`, `await useFetch(...)`) блокує рендер сторінки, доки
  дані не готові — і на сервері, і при переході всередині застосунку.
- **`onServerPrefetch`** (хук Vue) — щоб async-робота завершилась **на сервері** й
  потрапила в payload. Використовується всередині `useServerQuery`.
- **Ручний `<Suspense>`** доречний лише для **вкладеної** async-межі: коли async-
  дочірній компонент має показувати власний fallback, не блокуючи всю сторінку.

---

## 4. Стилі (CSS) і шрифти при SSR — коли миготить і як прибрати

Часте питання: «чи треба щось робити, щоб стилі прийшли одразу при SSR?».
Коротко — **у проді ні: стилі вже в `<head>` до першого показу**. Спалах
нестилізованого контенту (FOUC), який інколи видно, — це майже завжди `nuxt dev`.

### 4.1 Чому в `dev` миготить, а в проді ні
Nuxt резолвить `features.inlineStyles` так (спрощено, `@nuxt/schema` 4.x):
- **`nuxt dev`** → `inlineStyles` примусово `false`. Vite віддає CSS через JS і вставляє
  `<style>` **після** гідрації → звідси FOUC. Тільки в деві.
- **`nuxt build` (ssr:true)** → дефолт `id => id.includes('.vue')`: стилі компонентів
  **інлайняться в HTML**.

### 4.2 Що летить у HTML у проді

| Джерело | Доставка при SSR | Коли готове |
|---|---|---|
| Глобальний CSS — `~/core/tokens/main.css` + Tailwind | **інлайн** `<style>` у `<head>` | разом з HTML, 0 окремих запитів |
| Стилі `.vue`-компонентів (`<style scoped>`) | **інлайн** `<style>` у `<head>` | разом з HTML |

Тут `features.inlineStyles: true` (§4.3) — тож окремого `<link rel="stylesheet">` немає,
стилі приходять у самому документі. Браузер малює одразу після парсингу HTML, без
render-blocking round-trip на CSS. **FOUC у проді немає.**

> Перевірено на прод-білді: у `<head>` один `<style>` (увесь CSS проекту, ~2.86 KB gzip)
> і `<link rel="preload" as="font">`, а `<link rel="stylesheet">` **відсутній**.

### 4.3 Як увімкнено: `inlineStyles: true`
Проект інлайнить увесь CSS у HTML:
```ts
// nuxt.config.ts
features: { inlineStyles: true }
```
**Чому це тут виправдано:** зібраний CSS крихітний — **~11.6 KB (2.86 KB gzip)**. Інлайн
економить render-blocking round-trip на першому показі (браузер не тягне окремий `.css`),
а «мінус» — CSS не кешується окремо між сторінками — при 3 KB мізерний.

**Коли вимкнути (`inlineStyles: false`):** якщо CSS розросте до десятків/сотень KB — тоді
один спільний кешований `<link>` вигідніший за інлайн у кожну відповідь.

### 4.4 Шрифти — окрема вісь (FOUT, не CSS)
Навіть коли CSS на місці, self-hosted шрифт із `font-display: swap` дає **FOUT**: спершу
системний шрифт, потім перестрибування на свій — бо `.woff2` тягнеться асинхронно. CSS
тут ні до чого.

Як зроблено в проекті (шрифт — **Montserrat**, variable):
1. **woff2, не ttf.** Сирий Google-`.ttf` (~688 KB) сконвертовано в `.woff2` (~214 KB) —
   variable-вісь `wght 100–900` лишається в одному файлі:
   `npx --yes ttf2woff2 < in.ttf > out.woff2`.
2. **Публічний, нехешований шлях.** Файли в `public/fonts/`
   (`/fonts/Montserrat-Variable.woff2`), не в бандлі — бо preload потребує стабільного
   URL, а бандл дає хеш.
3. **`@font-face`** у `app/core/tokens/fonts.css` вказує на цей `/fonts/…`;
   `typography.ts` виставляє `fontFamily` на `Montserrat`.
4. **Guarded preload** у `nuxt.config.ts`:
   ```ts
   const CRITICAL_FONT = 'Montserrat-Variable.woff2'
   const fontPreload = existsSync(fileURLToPath(new URL(`./public/fonts/${CRITICAL_FONT}`, import.meta.url)))
     ? [{ rel: 'preload', as: 'font', type: 'font/woff2', href: `/fonts/${CRITICAL_FONT}`, crossorigin: 'anonymous' }]
     : []
   // ...
   app: { head: { link: [...fontPreload] } },
   ```
   `existsSync` — щоб `<link>` додавався, ЛИШЕ коли файл реально є (інакше 404 +
   «preloaded but not used»). `crossorigin` для шрифтів обов'язковий, інакше браузер
   тягне файл двічі.

> Альтернатива без ручного шляху — модуль `@nuxt/fonts` (сам знаходить `@font-face`,
> self-host'ить, додає preload). Зараз не підключений.

### 4.5 Як перевірити (не по `dev`!)
```bash
npm run build && npm run preview
```
`view-source` сторінки → у `<head>` є інлайн `<style>` (увесь CSS — бо `inlineStyles:
true`) і `<link rel="preload" as="font">` (шрифт), а окремого `<link rel="stylesheet">`
нема. У `dev` натомість інлайн вимкнено (CSS через JS) — тому й перевіряй на `build`.

---

## 5. Що працює лише на клієнті (і як це позначити)

Код, який чіпає браузерні API, **впаде на сервері** (`window`, `document`,
`localStorage`, `navigator` там не існують). Захищай так:

| Інструмент | Навіщо |
|---|---|
| `<ClientOnly>` | Обгортка навколо компонента, який рендериться **тільки** в браузері (не-SSR-safe бібліотеки, віджети на `window`). |
| `import.meta.client` / `import.meta.server` | Гілкування коду по середовищу. Є в `useServerQuery`, `createHttp`, плагіні `vue-query`. |
| `onMounted(() => …)` | Виконується лише на клієнті після монтування — безпечне місце для `window`/`document`. |

```vue
<ClientOnly>
  <HeavyBrowserWidget />
  <template #fallback>Завантаження…</template>
</ClientOnly>
```

---

## 6. Що працює лише на сервері (серверні компоненти та серверний код)

Симетрично до §5: є речі, які мають жити **тільки на сервері** — секрети, ключі до
API, доступ до БД, важкі залежності, яких не хочеш у клієнтському бандлі.

### 6.1 Серверні компоненти (Nuxt Server Components / islands)
- **Що:** компонент, що рендериться **лише на сервері** й віддає готовий HTML **без
  JS** у клієнтський бандл. Протилежність `<ClientOnly>`.
- **Коли:** важкий/статичний контент (рендер Markdown, підсвітка коду, великі
  залежності), якому не потрібен інтерактив на клієнті → менший JS-бандл.
- **Як:** експериментальна фіча — вмикається `experimental: { componentIslands: true }`
  у `nuxt.config`. Далі компонент із суфіксом `Name.server.vue` або `<NuxtIsland>`.
  Інтерактивні вставки всередині острова — через `nuxt-client` (окреме налаштування).
- **Статус у проекті:** зараз **не** увімкнено (немає потреби). Це опційно.

| Тип компонента | Рендер | JS на клієнті | Коли |
|---|---|---|---|
| Звичайний | сервер + клієнт (hydration) | так | дефолт, є інтерактив |
| `<ClientOnly>` | лише клієнт | так | браузерні API |
| Серверний (`*.server.vue`) | лише сервер | ні | статика, важкі залежності, без інтерактиву |

### 6.2 Серверний код — директорія `server/` (Nitro)
Тут живе **бекенд** застосунку. У цьому проекті — `server/api` + `server/repositories`.

| Папка | Що | У проекті |
|---|---|---|
| `server/api/*` | HTTP-ендпоінти (`defineEventHandler`) | `news.get.ts`, `bookmarks.get/post.ts` |
| `server/repositories/*` | серверний data-access: зовнішні API, БД, **секрети** | `newsRepository.ts` (ключ newsdata.io), `bookmarksRepository.ts` |
| `server/routes/*` | не-`/api` маршрути (напр. `/sitemap.xml`) | — |
| `server/middleware/*` | код на **кожен** запит (auth, заголовки) | — |
| `server/plugins/*` | хуки життєвого циклу Nitro | — |
| `server/utils/*` | автоімпортовані серверні хелпери | — |

### 6.3 Серверні утиліти, які знадобляться
- **`useRuntimeConfig(event)`** — читати приватний конфіг/секрети (лише сервер);
  напр. `server/api/news.get.ts` бере `newsApiKey`.
- **`createError({ statusCode, statusMessage })`** — кинути HTTP-помилку з роуту.
- **`defineCachedEventHandler` / `routeRules`** (`swr`, `isr`, `cache`) — серверне
  кешування відповіді.
- **`import.meta.server`** — гілка коду лише для сервера (є в `useServerQuery`, плагіні
  `vue-query`).

**Головне правило:** усе, що містить **секрет** (API-ключ, токен, доступ до БД), має
бути на сервері. Саме тому ключ newsdata.io лежить у
`server/repositories/newsRepository.ts`, а сторінка звертається до нього через власний
роут `/api/news`, а не напряму.

---

## 7. Типові граблі SSR

1. **Hydration mismatch** — HTML із сервера має збігатися з першим рендером на
   клієнті. Ламають: `Date.now()`, `Math.random()`, гілки по `window` під час рендеру,
   різні локаль/таймзона. Лікування: винести в `<ClientOnly>` або `onMounted`.
2. **Спалах «Loading…» при переході** — якщо запит стартує лише в браузері. Для SSR-
   сторінки рішення — `await` у setup (див. §3), як зроблено в `news-ssr.vue`.
3. **Стрибки картинок (CLS)** — `<NuxtImg>` без зарезервованої висоти штовхає контент,
   коли зображення довантажилось. Задавай фіксований бокс: `width` + `height` **та**
   класи `h-/w-` (бо Tailwind preflight ставить `img{height:auto}` і перебиває атрибут),
   плюс `object-cover`. Приклад — `news-ssr.vue`.
4. **`window is not defined`** — звернення до браузерного API на top-level setup.
   Загорни в `import.meta.client` / `onMounted`.

---

## 8. Куди дивитись у коді

| Хочу побачити… | Файл |
|---|---|
| Усі приклади на одній сторінці | `app/pages/index.vue` |
| SSR + кеш | `app/pages/news-ssr.vue` + `app/core/composables/useServerQuery.ts` |
| Client-only + кеш | `app/pages/news-spa.vue` + `app/core/composables/useClientQuery.ts` |
| Разовий запит | `app/pages/news-oneoff.vue` + `app/core/composables/useApi.ts` |
| Мутація + інвалідація | `app/pages/bookmarks.vue` + `app/core/composables/useApiMutation.ts` |
| Гідрація TanStack (dehydrate/hydrate) | `app/core/plugins/vue-query.ts` |
| Стилі/шрифти при SSR (inline + preload) | §4 + `nuxt.config.ts` (`inlineStyles`, `fontPreload`) + `public/fonts/` |
| Серверний ендпоінт + секрети | `server/api/news.get.ts` + `server/repositories/newsRepository.ts` |
| Серверні компоненти (islands) | `experimental.componentIslands` у `nuxt.config` (опційно) |
| Вимкнути SSR на маршруті | `nuxt.config.ts` → `routeRules` |

---

## TL;DR

- За замовчуванням — **SSR**; вимикай точково для приватних/важко-інтерактивних сторінок.
- Просто дані в HTML → **`useFetch`**. Треба ще кеш/інвалідація → **`useServerQuery`**.
- Клієнтська сторінка (ssr:false) → **`useClientQuery`**. Разово → **`useApi`**. Зміни → **`useApiMutation`**.
- `<Suspense>` дає Nuxt — просто став `await` у setup. Браузерне — у `<ClientOnly>` / `onMounted` / `import.meta.client`.
- Стилі при SSR — інлайняться в HTML (`features.inlineStyles: true`), тож приходять з документом (FOUC буває лише в `dev`). Шрифти → `preload` woff2 зі стабільного `public/fonts/` проти FOUT.
- Секрети/ключі/БД/важкі залежності → **сервер**: `server/api` + `server/repositories`, за потреби серверні компоненти (`*.server.vue`).
