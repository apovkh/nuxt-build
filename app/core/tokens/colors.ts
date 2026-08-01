// Джерело правди для кольору — його читає тема Vuetify (~/core/plugins/vuetify.ts)
// і Tailwind (./tailwind.config.ts), тож одна правка тут рухає обидва.
//
// Токени розбиті на групи:
//   base    — white/black: абсолютні значення, однакові в будь-якій темі
//   brand   — brand-*: фіксована айдентика, теж НЕ перемикається в темній
//   status  — error/info/success/warning: семантика стану (ці імена Vuetify
//             читає сам — валідація, алерти)
//   text    — primary/secondary: чорнило поверх поверхонь, перемикається в темній
//   surface — поверхні й лінії, перемикається в темній
//
// Група «text» навмисно БЕЗ префікса в ключах: утиліта вже несе його сама, тож
// клас читається як `text-primary`, а не `text-text-primary`. Через це:
//   • колір ДІЇ (кнопки, лінки, фокус інпутів) — це `brand-primary`, а не `primary`;
//     kit-компоненти передають color="brand-primary" явно;
//   • `primary`/`secondary` у темі Vuetify означають ТЕКСТ, а не акцент —
//     на відміну від дефолтної конвенції Vuetify.

// ── Base ────────────────────────────────────────────────────────────────────
export const BASE_COLORS = {
  white: '#ffffff',
  black: '#000000',
} as const

// ── Brand ───────────────────────────────────────────────────────────────────
// Фіксована айдентика: на відміну від токенів нижче вони НЕ перемикаються між
// темами — brand-secondary лишається темним і в темній темі. Нейтралей тут
// навмисно немає: canvas/border/muted живуть у групі surface, і другий комплект
// лише розходився б із темою.
//
// Рампа primary задана один раз; `brand-primary` (щабель 600) і
// `brand-secondary` (щабель 900) — псевдоніми в неї, а не другі копії тих
// самих hex. Тому окремого `brand-primary-600` немає: це і є `brand-primary`.
const BRAND_PRIMARY_RAMP = {
  50: '#e3f1f7',
  100: '#c2e2ee',
  200: '#8ecae6', // м'який фон / ілюстрації
  400: '#4fb3d1',
  600: '#219ebc',
  900: '#023047',
} as const

export const BRAND_COLORS = {
  'brand-primary': BRAND_PRIMARY_RAMP[600], // дія: кнопки, лінки, фокус
  'brand-primary-50': BRAND_PRIMARY_RAMP[50],
  'brand-primary-100': BRAND_PRIMARY_RAMP[100],
  'brand-primary-200': BRAND_PRIMARY_RAMP[200],
  'brand-primary-400': BRAND_PRIMARY_RAMP[400],
  'brand-primary-900': BRAND_PRIMARY_RAMP[900],
  'brand-secondary': BRAND_PRIMARY_RAMP[900], // ink / темні поверхні
  'brand-accent': '#ffb703', // увага — з нього походить status warning
  'brand-accent-600': '#fb8500', // темніший щабель акценту — CTA
} as const

// ── Status (семантика) ──────────────────────────────────────────────────────
// Імена зафіксовані Vuetify: повідомлення валідації, VAlert і подібне беруть
// саме `error`/`success`/`warning`/`info`, тому перейменувати їх не можна.
export const STATUS_COLORS = {
  error: '#dc2626',
  info: '#0ea5e9',
  success: '#1a9e56',
  warning: BRAND_COLORS['brand-accent'],
} as const

// ── Text ────────────────────────────────────────────────────────────────────
// Класи: text-primary / text-secondary. Працюють і в пропі color компонентів
// Vuetify (color="secondary"), бо ключ не має власного префікса.
export const TEXT_COLORS = {
  primary: BRAND_COLORS['brand-secondary'], // заголовки, основний текст
  secondary: '#55707f', // підписи, hint, вторинний текст
} as const

// ── Surface ─────────────────────────────────────────────────────────────────
export const SURFACE_COLORS = {
  surface: BASE_COLORS.white, // картки, поповери
  background: '#f4f8fb', // canvas сторінки
  muted: '#eef4f7', // приглушена заливка
  border: '#e4eef3', // лінії, розділювачі
  highlight: BRAND_COLORS['brand-primary-50'], // вибраний/активний рядок
} as const

export const colors = {
  ...BASE_COLORS,
  ...BRAND_COLORS,
  ...STATUS_COLORS,
  ...TEXT_COLORS,
  ...SURFACE_COLORS,
} as const

// Темна тема перекриває лише текст і поверхні — base і brand лишаються собою.
// Усе, що читається через Tailwind-утиліти, бере значення з --v-theme-* (див.
// tailwind.config.ts), тож перекриті тут ключі автоматично «перевертаються»
// і в @apply-класах.
export const darkColors = {
  ...colors,
  primary: '#e8f3f8',
  secondary: '#9fc0d0',
  surface: '#0a3a54',
  background: '#023047',
  muted: '#0f4a68',
  border: '#12506f',
  highlight: '#0f4a68',
} as const

export type ColorToken = keyof typeof colors
