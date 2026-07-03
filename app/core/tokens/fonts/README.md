# Fonts — moved to /public/fonts

Self-hosted fonts now live in **`/public/fonts/`**, not here.

Why: a public, unhashed path (e.g. `/fonts/Montserrat-Variable.woff2`) gives a stable
URL that `nuxt.config.ts` can `<link rel="preload">` for faster first paint. A
bundled/hashed path can't be preloaded by a static href.

See `public/fonts/README.md`. This folder is kept only as a signpost.
