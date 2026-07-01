import type { ApiError } from '~/core/types'
import { normalizeApiError } from '~/core/composables/useApiError'

type Notifier = (e: ApiError) => void
let notifier: Notifier | null = null

// Проект підключає свій тост/нотифікацію ОДИН раз (напр. у плагіні після ініціалізації UI):
//   setApiErrorNotifier((e) => useNuxtApp().$toast.error(e.message))
export function setApiErrorNotifier(fn: Notifier) {
  notifier = fn
}

// Єдина точка обробки помилок API. Нормалізує → логує → нотифікує.
// Викликається глобально з TanStack cache і з useApi. opts.silent вимикає нотифікацію.
export function handleGlobalApiError(err: unknown, opts?: { silent?: boolean }): ApiError {
  const e = normalizeApiError(err)

  if (import.meta.dev) console.error('[API]', e.statusCode, e.message, e.data)
  if (!opts?.silent) notifier?.(e)

  return e
}
