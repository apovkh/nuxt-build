import type { Config } from 'tailwindcss'
import { colors } from './tokens/colors'
import { layout, typography } from './tokens/typography'

// hex #rrggbb → 'r,g,b' — щоб зібрати rgba() з різною альфою на щаблях тіні
// з одного токена кольору (тіні потребують rgba, а токен — hex).
function channels(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16)

  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}
// Ink тіней — brand-secondary. Тінь лишається темною в обох темах, тож беремо
// фіксований брендовий колір, а не семантичний токен, що перевертається.
const shadowInk = channels(colors['brand-secondary'])

// Кожен токен віддаємо як посилання на CSS-змінну теми Vuetify, а не як hex.
// Vuetify друкує їх трійками "R,G,B" на .v-theme--light / .v-theme--dark, тож
// один і той самий клас (bg-surface, text-primary) перемикається разом із
// темою. З hex-значеннями Tailwind-утиліти були б статичні й у темній темі
// давали б, наприклад, темний текст на темному тлі.
// <alpha-value> зберігає модифікатори прозорості: bg-brand-primary/10 працює як завжди.
// Саме rgba(..., a), а НЕ rgb(... / a): Vuetify друкує канали через кому
// ("2,48,71"), а слеш-синтаксис вимагає пробілів — rgb(2,48,71/1) не парситься
// зовсім, і колір мовчки падає в inherit (чорний).
const themeColors = Object.fromEntries(
  Object.keys(colors).map(key => [key, `rgba(var(--v-theme-${key}), <alpha-value>)`]),
) as Record<keyof typeof colors, string>

// Tailwind pulls values from tokens/* — the same source as the Vuetify theme.
export default <Partial<Config>>{
  theme: {
    extend: {
      colors: themeColors,
      fontFamily: {
        sans: [typography.fontFamily.sans],
        heading: [typography.fontFamily.heading],
      },
      fontSize: typography.fontSize,
      borderRadius: {
        DEFAULT: layout.radius,
      },
      // Шкала тіней: один ink-колір (brand-secondary з токена) на всіх щаблях,
      // зростання розмиття+насиченості sm→xl,
      // тож тіні читаються як єдина система. sm — контур, md — картка (спокій),
      // lg — підняття/ховер, xl — оверлеї (тостер, поповери, модалки).
      boxShadow: {
        sm: `0 1px 2px rgba(${shadowInk},0.05)`,
        md: `0 1px 2px rgba(${shadowInk},0.05), 0 10px 30px -18px rgba(${shadowInk},0.16)`,
        lg: `0 1px 2px rgba(${shadowInk},0.05), 0 16px 40px -22px rgba(${shadowInk},0.22)`,
        xl: `0 2px 4px rgba(${shadowInk},0.06), 0 28px 56px -24px rgba(${shadowInk},0.28)`,
      },
    },
  },
}
