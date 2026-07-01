import { reactive, ref } from 'vue'
import { FetchError } from 'ofetch'
import { ruleToText } from '~/core/utils/ruleToText'
import { handleGlobalApiError } from '~/core/utils/handleApiError'

// Формат помилок валідації бекенду (422): [ [field, rule, params], ... ]
export type ValidationErrors = Array<[string, string, Array<number | string>]>

export default function useForm<
  TFormData extends Record<string, unknown>,
  TApiResult,
>(
  apiFn: (args: TFormData) => Promise<TApiResult>,
  formData: TFormData,
  onSuccess?: (res: TApiResult) => void,
) {
  const form = reactive(formData) as TFormData
  const errors = ref<Partial<Record<keyof TFormData, string>>>({})
  const pending = ref(false)
  const success = ref(false)

  async function send() {
    errors.value = {}
    pending.value = true
    success.value = false

    try {
      const res = await apiFn(form)
      success.value = true
      onSuccess?.(res)
    }
    catch (e) {
      const status = e instanceof FetchError ? (e.statusCode ?? e.response?.status) : undefined

      if (e instanceof FetchError && status === 422) {
        // помилки валідації → по полях (специфічно для форми)
        const list = e.data as ValidationErrors
        list?.forEach(([field, rule, params]) => {
          if (field in form) {
            errors.value[field as keyof TFormData] = ruleToText(rule, params)
          }
        })
      }
      else {
        // все інше (500/мережа/таймаут) → глобальний обробник (тост/лог), не дублюємо у формі
        handleGlobalApiError(e)
      }
    }
    finally {
      pending.value = false
    }
  }

  return { form, errors, pending, success, send }
}
