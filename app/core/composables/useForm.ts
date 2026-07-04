import type { ValidationRule } from '~/core/utils/validation/rules'
import { FetchError } from 'ofetch'
import { reactive, ref } from 'vue'
import { handleGlobalApiError } from '~/core/utils/handleApiError'
import { tValidation } from '~/core/utils/validation/messages'

// Backend validation error format (422): [ [field, rule, params], ... ]
export type ValidationErrors = Array<[string, string, Array<number | string>]>

type FieldErrors<T> = Partial<Record<keyof T, string[]>>
type FieldRules<T> = Partial<Record<keyof T, ValidationRule[]>>

export default function useForm<
  TFormData extends Record<string, unknown>,
  TApiResult,
>(
  apiFn: (args: TFormData) => Promise<TApiResult>,
  formData: TFormData,
  onSuccess?: (res: TApiResult) => void,
  fieldRules?: FieldRules<TFormData>,
) {
  const form = reactive(formData) as TFormData
  // errors as string[] — compatible with Vuetify :error-messages. For a plain input use errors.x?.[0].
  const errors = ref<FieldErrors<TFormData>>({})
  const pending = ref(false)
  const success = ref(false)

  // Validate a single field with client-side rules. Call on @blur for live feedback.
  function validateField(name: keyof TFormData): boolean {
    const rulesForField = fieldRules?.[name]

    if (!rulesForField)
      return true

    const messages: string[] = []
    for (const rule of rulesForField) {
      const result = rule(form[name])

      if (result !== true)
        messages.push(result)
    }

    if (messages.length)
      errors.value[name] = messages
    else delete errors.value[name]

    return messages.length === 0
  }

  function validateAll(): boolean {
    if (!fieldRules)
      return true

    let isValid = true
    for (const name of Object.keys(fieldRules) as (keyof TFormData)[]) {
      if (!validateField(name))
        isValid = false
    }

    return isValid
  }

  async function send() {
    errors.value = {}

    // 1) client-side validation — don't hit the API if there are errors
    if (!validateAll())
      return

    pending.value = true
    success.value = false

    try {
      const result = await apiFn(form)
      success.value = true
      onSuccess?.(result)
    }
    catch (error) {
      const status = error instanceof FetchError ? (error.statusCode ?? error.response?.status) : undefined

      // 2) server-side validation (422) — same errors map, same messages
      if (error instanceof FetchError && status === 422) {
        const validationErrors = error.data as ValidationErrors
        validationErrors?.forEach(([field, rule, params]) => {
          if (field in form) {
            errors.value[field as keyof TFormData] = [tValidation(rule, params)]
          }
        })
      }
      else {
        // 3) everything else → global handler (toast/log)
        handleGlobalApiError(error)
      }
    }
    finally {
      pending.value = false
    }
  }

  function reset() {
    Object.assign(form, formData)
    errors.value = {}
    success.value = false
  }

  return { form, errors, pending, success, send, validateField, reset }
}
