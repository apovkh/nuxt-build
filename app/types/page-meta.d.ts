// Розширення page meta для layout page-shell (title/subtitle/maxWidth/breadcrumbs).
declare module '#app' {
  interface PageMeta {
    breadcrumbs?: { title: string, to?: string }[]
    title?: string
    subtitle?: string
    /** Tailwind-клас максимальної ширини контейнера, напр. 'max-w-[1600px]'. Дефолт: max-w-6xl. */
    maxWidth?: string
  }
}

export {}
