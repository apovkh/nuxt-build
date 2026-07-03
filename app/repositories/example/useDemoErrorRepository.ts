import { queryOptions } from '@tanstack/vue-query'

export interface DemoErrorResult {
  ok: boolean
  message: string
}

/**
 * Демо-ресурс: єдиний ендпоінт `/demo-error?status=`, що навмисно віддає заданий
 * HTTP-статус. Живить сторінку /errors — показ обробки помилок по типах запитів.
 * Конвенція методів: `*Query()` → кешовані (queryOptions); дієслова → сирі/разові виклики.
 */
export function useDemoErrorRepository() {
  const http = useHttp()

  // Сирий виклик транспорту (без само-нотифікації) — для кешованих запитів, мутацій
  // і useForm, де глобально нотифікує вже TanStack cache / сам useForm мапить 422.
  const request = (status: number) =>
    http<DemoErrorResult>('/example/demo-error', { query: { status } })

  return {
    request,
    /**
     * Разовий виклик через useApi: сам віддає помилку глобальному хендлеру (toast/log)
     * і ре-throw'ить, щоб компонент зловив її локально (useApiError).
     */
    requestOnce: (status: number) =>
      useApi<DemoErrorResult>('/example/demo-error', { query: { status } }),
    /**
     * Кешований запит для useClientQuery. retry: false — щоб помилка показалась одразу,
     * без ретраїв TanStack.
     */
    statusQuery: (status: number) =>
      queryOptions({ queryKey: ['demo-error', status], queryFn: () => request(status), retry: false }),
  }
}
