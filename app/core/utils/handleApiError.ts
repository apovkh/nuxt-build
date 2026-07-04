import type { ApiError } from '~/core/types'
import { normalizeApiError } from '~/core/composables/useApiError'

type Notifier = (e: ApiError) => void
let notifier: Notifier | null = null

// The project wires up its own toast/notification ONCE (e.g. in a plugin after UI init):
//   setApiErrorNotifier((e) => useNuxtApp().$toast.error(e.message))
export function setApiErrorNotifier(notify: Notifier) {
  notifier = notify
}

// Single entry point for API error handling. Normalizes → logs → notifies.
// Called globally from the TanStack cache and from useApi. opts.silent disables the notification.
export function handleGlobalApiError(err: unknown, opts?: { silent?: boolean }): ApiError {
  const normalized = normalizeApiError(err)

  if (import.meta.dev)
    console.error('[API]', normalized.statusCode, normalized.message, normalized.data)

  if (!opts?.silent)
    notifier?.(normalized)

  return normalized
}
