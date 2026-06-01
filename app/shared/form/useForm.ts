import type { Rule } from './rules'
import { useVForm } from './useVForm'

// Higher-level wrapper around `useVForm`. Manages submit state and lets callers
// declare per-field rules in one place instead of binding `:rules` inline.

export interface UseFormOptions<T> {
  rules?: Partial<Record<keyof T, Rule[]>>
}

export function useForm<T extends Record<string, unknown>>(
  initial: T,
  options: UseFormOptions<T> = {},
) {
  const { formRef, validateForm, resetForm } = useVForm()
  const values = reactive({ ...initial }) as T
  const isSubmitting = ref(false)

  function rulesFor<K extends keyof T>(field: K): Rule[] {
    return options.rules?.[field] ?? []
  }

  async function submit(handler: (values: T) => Promise<void> | void) {
    const valid = await validateForm()

    if (!valid)
      return false

    isSubmitting.value = true
    try {
      await handler(values)

      return true
    }
    finally {
      isSubmitting.value = false
    }
  }

  function reset() {
    Object.assign(values, initial)
    resetForm()
  }

  return { formRef, values, isSubmitting, rulesFor, submit, reset }
}
