import { reactive, ref } from 'vue'
import { FetchError } from 'ofetch'
import type { ValidationRule } from '~/core/utils/validation/rules'
import { tValidation } from '~/core/utils/validation/messages'
import { handleGlobalApiError } from '~/core/utils/handleApiError'

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
    if (!rulesForField) return true

    const msgs: string[] = []
    for (const rule of rulesForField) {
      const res = rule(form[name])
      if (res !== true) msgs.push(res)
    }

    if (msgs.length) errors.value[name] = msgs
    else delete errors.value[name]

    return msgs.length === 0
  }

  function validateAll(): boolean {
    if (!fieldRules) return true
    let ok = true
    for (const name of Object.keys(fieldRules) as (keyof TFormData)[]) {
      if (!validateField(name)) ok = false
    }
    return ok
  }

  async function send() {
    errors.value = {}
    // 1) client-side validation — don't hit the API if there are errors
    if (!validateAll()) return

    pending.value = true
    success.value = false

    try {
      const res = await apiFn(form)
      success.value = true
      onSuccess?.(res)
    }
    catch (e) {
      const status = e instanceof FetchError ? (e.statusCode ?? e.response?.status) : undefined

      // 2) server-side validation (422) — same errors map, same messages
      if (e instanceof FetchError && status === 422) {
        const list = e.data as ValidationErrors
        list?.forEach(([field, rule, params]) => {
          if (field in form) {
            errors.value[field as keyof TFormData] = [tValidation(rule, params)]
          }
        })
      }
      else {
        // 3) everything else → global handler (toast/log)
        handleGlobalApiError(e)
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
