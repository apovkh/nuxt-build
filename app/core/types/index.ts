// Shared core types.
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

// Core transport provided by the core/plugins/api.ts plugin.
// $api (the structured SDK) is typed at the project level — see app/types.
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
