// ⚠️ ПРОСТО запит — без кешу, без TanStack, без SSR-payload.
// Пряма обгортка над $api (з інтерсепторами) для разових викликів: експорт, перевірка, службовий виклик.
// Повертає Promise<T>. Потрібен кеш → use*Query; потрібен SSR-payload без кешу → useFetch.
export function useApi<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  const { $api } = useNuxtApp()
  return $api<T>(url, opts)
}
