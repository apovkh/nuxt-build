# app/core — ядро проекту

Базові функції, конфіг і дизайн-токени, які переиспользуються по всьому застосунку.
Структура повторює конвенції Nuxt, тож за потреби ядро легко піднімається в окремий layer.

## Структура

```
app/core/
├─ nuxt.core.config.ts   # Nuxt-налаштування ядра (imports/plugins/css/tailwind)
├─ tailwind.config.ts    # тягне кольори/типографіку з tokens/
├─ composables/          # useApi, useApiMutation, useClientQuery, useServerQuery, useForm
├─ plugins/              # api.ts ($fetch-клієнт), vue-query.ts (TanStack + SSR)
├─ utils/config.ts       # coreConfig — рантайм-дефолти (staleTime, timeout, polling)
├─ components/           # базові UI (BaseButton, …)
├─ tokens/               # ДЖЕРЕЛО ПРАВДИ: colors.ts, typography.ts, index.ts (Vuetify+Tailwind)
│  ├─ fonts.css, main.css
│  └─ fonts/             # self-hosted .woff2
└─ types/                # спільні типи + типізація $api
```

## Підключення в кореневому nuxt.config

```ts
// nuxt.config.ts (корінь проекту)
import { defu } from 'defu'
import { coreNuxtConfig } from './app/core/nuxt.core.config'

export default defineNuxtConfig(
  defu(
    {
      // проектні налаштування
      modules: ['@nuxtjs/tailwindcss'],
      runtimeConfig: {
        public: {
          apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
        },
      },
    },
    coreNuxtConfig, // база — другим аргументом; defu глибоко мержить і конкатенує масиви
  ),
)
```

`defu` (йде разом з Nuxt) мержить конфіги глибоко й **конкатенує** масиви (`css`, `plugins`,
`components`), тож ядрові та проектні значення складаються, а не перезатираються.

## Порядок плагінів

Якщо ядрові плагіни (`api`, `vue-query`) мають ініціалізуватись до проектних —
постав `coreNuxtConfig` першим аргументом `defu(coreNuxtConfig, {...})`
або додай плагінам `enforce: 'pre'`.

## Шпаргалка вибору composable

| Потреба | Composable |
|---|---|
| SSR-сторінка з кешем | `useServerQuery` |
| SPA-адмінка з кешем | `useClientQuery` |
| Зміна даних на бекенді | `useApiMutation` |
| Разові дані без кешу (просто запит) | `useApi` |
| Форма з валідацією | `useForm` |
