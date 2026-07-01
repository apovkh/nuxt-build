import { createHttp } from '~/core/utils/createHttp'

// Core transport. Available as useNuxtApp().$http — raw $fetch with interceptors.
// The project SDK ($api.<domain>.<method>) is built on top of it in app/plugins/api.ts.
export default defineNuxtPlugin(() => {
  return { provide: { http: createHttp() } }
})
