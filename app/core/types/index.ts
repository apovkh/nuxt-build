// Спільні типи ядра.
export interface ApiError {
  statusCode: number
  message: string
  data?: unknown
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// Типізація $api, який додає плагін core/plugins/api.ts
declare module '#app' {
  interface NuxtApp {
    $api: typeof $fetch
  }
}
declare module 'vue' {
  interface ComponentCustomProperties {
    $api: typeof $fetch
  }
}

export {}
