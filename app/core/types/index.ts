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

// Транспорт ядра, який додає плагін core/plugins/api.ts.
// $api (структурований SDK) типізується на рівні проекту — див. app/types.
declare module '#app' {
  interface NuxtApp {
    $http: typeof $fetch
  }
}
declare module 'vue' {
  interface ComponentCustomProperties {
    $http: typeof $fetch
  }
}

export {}
