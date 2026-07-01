import { handleGlobalApiError } from '~/core/utils/handleApiError'

// ⚠️ ПРОСТО запит — без кешу, без TanStack, без SSR-payload.
// Пряма обгортка над транспортом ядра ($http) для разових викликів за URL.
// Помилки маршрутизуються в глобальний обробник і прокидаються далі (для локальної обробки).
export async function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  const { $http } = useNuxtApp()
  try {
    return await $http<T>(url, opts)
  } catch (err) {
    handleGlobalApiError(err)
    throw err
  }
}
