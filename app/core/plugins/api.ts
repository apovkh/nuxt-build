import { createHttp } from '~/core/utils/createHttp'

// Транспорт ядра. Доступний як useNuxtApp().$http — raw $fetch з інтерсепторами.
// Проектний SDK ($api.<domain>.<method>) будується поверх нього у app/plugins/api.ts.
export default defineNuxtPlugin(() => {
  return { provide: { http: createHttp() } }
})
