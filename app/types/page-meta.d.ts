// Page meta extension for the page-shell layout (title/subtitle/maxWidth/breadcrumbs).
declare module '#app' {
  interface PageMeta {
    breadcrumbs?: { title: string, to?: string }[]
    title?: string
    subtitle?: string
    /** Tailwind class for the container max width, e.g. 'max-w-[1600px]'. Default: max-w-6xl. */
    maxWidth?: string
  }
}

export {}
