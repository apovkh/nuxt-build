import { queryOptions } from '@tanstack/vue-query'

export interface DemoErrorResult {
  ok: boolean
  message: string
}

/**
 * Demo resource: a single `/demo-error?status=` endpoint that deliberately responds
 * with the given HTTP status. Powers the /errors page — showcases error handling per request type.
 * Method convention: `*Query()` → cached (queryOptions); verbs → raw/one-off calls.
 */
export function useDemoErrorRepository() {
  const http = useHttp()

  // Raw transport call (no self-notification) — for cached queries, mutations
  // and useForm, where the TanStack cache already notifies globally / useForm itself maps 422.
  const request = (status: number) =>
    http<DemoErrorResult>('/example/demo-error', { query: { status } })

  return {
    request,
    /**
     * One-off call via useApi: it hands the error to the global handler (toast/log)
     * itself and re-throws so the component can catch it locally (useApiError).
     */
    requestOnce: (status: number) =>
      useApi<DemoErrorResult>('/example/demo-error', { query: { status } }),
    /**
     * Cached query for useClientQuery. retry: false — so the error shows up immediately,
     * without TanStack retries.
     */
    statusQuery: (status: number) =>
      queryOptions({ queryKey: ['demo-error', status], queryFn: () => request(status), retry: false }),
  }
}
