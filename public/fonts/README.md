# Fonts (public)

Self-hosted fonts live here so they get a **stable, unhashed URL** — which is what lets
`nuxt.config.ts` emit a `<link rel="preload">` for the critical font, and what the
`@font-face` rules in `app/core/tokens/fonts.css` point at (`/fonts/…`).

## Current font: Montserrat (variable)

| File | Purpose |
|---|---|
| `Montserrat-Variable.woff2` | upright, weights **100–900** in one file (preloaded) |
| `Montserrat-Italic-Variable.woff2` | italic, weights 100–900 (not preloaded) |
| `Montserrat-OFL.txt` | SIL Open Font License — must ship alongside the font |

One variable file covers every weight (incl. in-between values), so `fonts.css` needs
just two `@font-face` rules (normal + italic) instead of one per weight.

## How it's wired

- `app/core/tokens/fonts.css` → `@font-face` with `src: url('/fonts/…') format('woff2')`
- `app/core/tokens/typography.ts` → `fontFamily.sans/heading = 'Montserrat'`
- `nuxt.config.ts` → **guarded** preload of `Montserrat-Variable.woff2`: the `<link>`
  is emitted only when the file exists, so a missing font never causes a 404 /
  "preloaded but not used" warning.

## Converting a raw font to woff2

Google Fonts ships `.ttf` (~688 KB for Montserrat variable). Convert to `.woff2`
(~214 KB, variable axis preserved) — no global install needed:

```bash
npx --yes ttf2woff2 < Montserrat-VariableFont_wght.ttf > Montserrat-Variable.woff2
```

## Changing the font

Replace the `.woff2`, then update: `@font-face` in `fonts.css`, `fontFamily` in
`typography.ts`, and `CRITICAL_FONT` in `nuxt.config.ts`. Public assets aren't
content-hashed, so bust caches by renaming (e.g. a version suffix) when shipping a new
file under the same name.
