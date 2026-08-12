<script setup lang="ts">
// Token showcase — reads ~/core/tokens, i.e. the same source as the Vuetify theme
// and Tailwind. Swatches are filled via --v-theme-*, not via hex: this way the page
// also verifies that a token actually made it into the theme and flips in dark mode.
import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js'
import { useTheme } from 'vuetify'
import {
  BASE_COLORS,
  BRAND_COLORS,
  darkColors,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  STATUS_COLORS,
  SURFACE_COLORS,
  TEXT_COLORS,
  TITLE,
  typography,
} from '~/core/tokens'

definePageMeta({
  title: 'Design tokens',
  subtitle: 'Colors and typography from ~/core/tokens — a single source for Vuetify and Tailwind.',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Design tokens' },
  ],
})

const theme = useTheme()
const isDark = computed(() => theme.name.value === 'dark')

interface Swatch {
  name: string
  light: string
  /** Dark-theme value — only when it differs from the light one. */
  dark: string | null
}

function toSwatches(group: Record<string, string>): Swatch[] {
  const inDark = darkColors as Record<string, string>

  return Object.entries(group).map(([name, light]) => ({
    name,
    light,
    dark: inDark[name] !== light ? inDark[name]! : null,
  }))
}

const colorGroups = [
  { title: 'Base', note: 'absolute values — the same in any theme', tokens: toSwatches(BASE_COLORS) },
  { title: 'Brand', note: 'fixed brand identity — deliberately does NOT flip in dark mode', tokens: toSwatches(BRAND_COLORS) },
  { title: 'Status', note: 'state semantics; Vuetify itself reads these names (validation, alerts)', tokens: toSwatches(STATUS_COLORS) },
  { title: 'Text', note: 'ink on top of surfaces — keys have no prefix, so the class reads as text-primary', tokens: toSwatches(TEXT_COLORS) },
  { title: 'Surface', note: 'surfaces and lines — flip in dark mode', tokens: toSwatches(SURFACE_COLORS) },
]

function swatchStyle(name: string) {
  return { backgroundColor: `rgb(var(--v-theme-${name}))` }
}

// Classes here are string literals because Tailwind scans the source code: a dynamic
// `text-${name}` would never make it into the build.
const textColors = [
  { cls: 'text-primary', note: 'headings, body text' },
  { cls: 'text-secondary', note: 'captions, hints, secondary text' },
  { cls: 'text-brand-primary', note: 'links and actions' },
  { cls: 'text-error', note: 'validation errors' },
  { cls: 'text-success', note: 'success state' },
  { cls: 'text-warning', note: 'warnings' },
  { cls: 'text-info', note: 'neutral hint' },
  { cls: 'text-brand-secondary', note: 'brand — stays dark in dark mode' },
  { cls: 'text-brand-accent-600', note: 'accent / CTA' },
]

// The scale Tailwind exposes (tokens/typography → aggregate `typography`).
const tailwindSizes = [
  { cls: 'text-xs', px: typography.fontSize.xs },
  { cls: 'text-sm', px: typography.fontSize.sm },
  { cls: 'text-base', px: typography.fontSize.base },
  { cls: 'text-lg', px: typography.fontSize.lg },
  { cls: 'text-xl', px: typography.fontSize.xl },
]

const weights = [
  { cls: 'font-normal', value: FONT_WEIGHT.normal },
  { cls: 'font-medium', value: FONT_WEIGHT.medium },
  { cls: 'font-semibold', value: FONT_WEIGHT.semibold },
  { cls: 'font-bold', value: FONT_WEIGHT.bold },
]

// The DS scale (base = 14px) is separate from the Tailwind scale (base = 16px), so we
// render it with inline styles straight from the token values.
const dsSizes = Object.entries(FONT_SIZE).map(([name, [size, { lineHeight }]]) => ({
  name,
  size,
  lineHeight,
  style: { fontSize: size, lineHeight },
}))

const titles = Object.entries(TITLE).map(([level, preset]) => ({
  level: Number(level),
  preset,
  style: {
    fontSize: FONT_SIZE[preset.size][0],
    lineHeight: FONT_SIZE[preset.size][1].lineHeight,
    fontWeight: FONT_WEIGHT[preset.weight],
    fontFamily: FONT_FAMILY[preset.family].join(', '),
    letterSpacing: LETTER_SPACING[preset.tracking],
  },
}))

const sample = 'The quick brown fox 0123'
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-secondary">
        Theme: <b class="text-primary">{{ isDark ? 'dark' : 'light' }}</b> — toggle it to see
        which tokens flip and which stay the same.
      </p>
      <UIBtn variant="outlined" size="small" @click="theme.toggle()">
        <UIIcon :icon="isDark ? mdiWeatherSunny : mdiWeatherNight" start size="small" />
        {{ isDark ? 'Light' : 'Dark' }}
      </UIBtn>
    </div>

    <!-- ── Colors ───────────────────────────────────────────────────────── -->
    <section v-for="group in colorGroups" :key="group.title" class="flex flex-col gap-3">
      <div>
        <h2 class="text-lg font-semibold text-primary">
          {{ group.title }}
        </h2>
        <p class="text-sm text-secondary">
          {{ group.note }}
        </p>
      </div>

      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="token in group.tokens"
          :key="token.name"
          class="flex items-center gap-3 rounded border border-border bg-surface p-3"
        >
          <div
            class="size-14 shrink-0 rounded border border-border"
            :style="swatchStyle(token.name)"
          />
          <div class="min-w-0">
            <div class="truncate text-[13px] font-semibold text-primary">
              {{ token.name }}
            </div>
            <div class="text-[11px] uppercase text-secondary">
              {{ token.light }}
              <template v-if="token.dark">
                · dark {{ token.dark }}
              </template>
            </div>
            <code class="text-[11px] text-secondary">bg-{{ token.name }}</code>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Text: colors ─────────────────────────────────────────────────── -->
    <section class="flex flex-col gap-3">
      <div>
        <h2 class="text-lg font-semibold text-primary">
          Text — colors
        </h2>
        <p class="text-sm text-secondary">
          The same tokens, now as Tailwind classes on top of the current theme.
        </p>
      </div>

      <ul class="flex flex-col gap-2 rounded border border-border bg-surface p-4">
        <li v-for="item in textColors" :key="item.cls" class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span class="text-base font-medium" :class="item.cls">{{ sample }}</span>
          <code class="text-[11px] text-secondary">{{ item.cls }}</code>
          <span class="text-[11px] text-secondary">{{ item.note }}</span>
        </li>
      </ul>
    </section>

    <!-- ── Text: sizes ──────────────────────────────────────────────────── -->
    <section class="flex flex-col gap-3">
      <div>
        <h2 class="text-lg font-semibold text-primary">
          Text — sizes
        </h2>
        <p class="text-sm text-secondary">
          Left — the Tailwind scale (base 16px), right — the DS scale from FONT_SIZE (base 14px).
        </p>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <ul class="flex flex-col gap-3 rounded border border-border bg-surface p-4">
          <li v-for="item in tailwindSizes" :key="item.cls" class="flex items-baseline gap-3">
            <code class="w-20 shrink-0 text-[11px] text-secondary">{{ item.cls }}</code>
            <span class="text-primary" :class="item.cls">{{ sample }}</span>
            <span class="ml-auto text-[11px] text-secondary">{{ item.px }}</span>
          </li>
        </ul>

        <ul class="flex flex-col gap-3 rounded border border-border bg-surface p-4">
          <li v-for="item in dsSizes" :key="item.name" class="flex items-baseline gap-3">
            <code class="w-28 shrink-0 text-[11px] text-secondary">FONT_SIZE.{{ item.name }}</code>
            <span class="text-primary" :style="item.style">{{ sample }}</span>
            <span class="ml-auto whitespace-nowrap text-[11px] text-secondary">
              {{ item.size }} / {{ item.lineHeight }}
            </span>
          </li>
        </ul>
      </div>
    </section>

    <!-- ── Text: weights ────────────────────────────────────────────────── -->
    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-semibold text-primary">
        Text — weights
      </h2>
      <ul class="flex flex-col gap-2 rounded border border-border bg-surface p-4">
        <li v-for="item in weights" :key="item.cls" class="flex items-baseline gap-3">
          <code class="w-28 shrink-0 text-[11px] text-secondary">{{ item.cls }}</code>
          <span class="text-base text-primary" :class="item.cls">{{ sample }}</span>
          <span class="ml-auto text-[11px] text-secondary">{{ item.value }}</span>
        </li>
      </ul>
    </section>

    <!-- ── Headings ─────────────────────────────────────────────────────── -->
    <section class="flex flex-col gap-3">
      <div>
        <h2 class="text-lg font-semibold text-primary">
          Headings
        </h2>
        <p class="text-sm text-secondary">
          TITLE presets: size + weight + typeface + tracking per level.
        </p>
      </div>

      <ul class="flex flex-col gap-4 rounded border border-border bg-surface p-4">
        <li v-for="item in titles" :key="item.level" class="flex flex-col gap-1">
          <span class="text-primary" :style="item.style">h{{ item.level }} · {{ sample }}</span>
          <code class="text-[11px] text-secondary">
            size {{ item.preset.size }} · weight {{ item.preset.weight }} ·
            family {{ item.preset.family }} · tracking {{ item.preset.tracking }}
          </code>
        </li>
      </ul>
    </section>
  </div>
</template>
