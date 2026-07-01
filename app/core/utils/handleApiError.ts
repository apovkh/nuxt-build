import type { ApiError } from '~/core/types'
import { normalizeApiError } from '~/core/composables/useApiError'

type Notifier = (e: ApiError) => void
let notifier: Notifier | null = null

// The project wires up its own toast/notification ONCE (e.g. in a plugin after UI init):
//   setApiErrorNotifier((e) => useNuxtApp().$toast.error(e.message))
export function setApiErrorNotifier(fn: Notifier) {
  notifier = fn
}

// Single entry point for API error handling. Normalizes → logs → notifies.
// Called globally from the TanStack cache and from useApi. opts.silent disables the notification.
export function handleGlobalApiError(err: unknown, opts?: { silent?: boolean }): ApiError {
  const e = normalizeApiError(err)

  if (import.meta.dev) console.error('[API]', e.statusCode, e.message, e.data)
  if (!opts?.silent) notifier?.(e)

  return e
}
