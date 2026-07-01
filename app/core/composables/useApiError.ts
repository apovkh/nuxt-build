import { ref, computed } from 'vue'
import type { ApiError } from '~/core/types'

// Normalizes any error ($fetch/ofetch FetchError, Error, unknown) into a single ApiError shape.
export function normalizeApiError(err: unknown): ApiError {
  const e = err as any

  // ofetch/$fetch FetchError: has statusCode, data (parsed response body), response
  if (e?.response || e?.statusCode) {
    return {
      statusCode: e.statusCode ?? e.response?.status ?? 0,
      message: e.data?.message ?? e.statusMessage ?? e.message ?? 'Помилка запиту',
      data: e.data,
    }
  }

  if (e instanceof Error) {
    return { statusCode: 0, message: e.message }
  }

  return { statusCode: 0, message: 'Невідома помилка' }
}

// Reactive API error handling for components/forms.
// const { error, isError, message, handleError, resetError, isUnauthorized } = useApiError()
export function useApiError() {
  const error = ref<ApiError | null>(null)

  const isError = computed(() => error.value !== null)
  const message = computed(() => error.value?.message ?? '')
  const status = computed(() => error.value?.statusCode ?? null)

  // Status helpers for common branching logic
  const isUnauthorized = computed(() => status.value === 401)
  const isForbidden = computed(() => status.value === 403)
  const isNotFound = computed(() => status.value === 404)
  const isValidation = computed(() => status.value === 422)
  const isServerError = computed(() => (status.value ?? 0) >= 500)

  // Accept an error, store it in state, and return the normalized shape
  function handleError(err: unknown): ApiError {
    const normalized = normalizeApiError(err)
    error.value = normalized
    return normalized
  }

  function resetError() {
    error.value = null
  }

  return {
    error,
    isError,
    message,
    status,
    isUnauthorized,
    isForbidden,
    isNotFound,
    isValidation,
    isServerError,
    handleError,
    resetError,
    normalizeError: normalizeApiError,
  }
}
