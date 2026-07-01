import { reactive, ref, computed } from 'vue'

type Errors<T> = Partial<Record<keyof T, string | undefined>>

interface UseFormOptions<T extends Record<string, any>> {
  initial: T
  /** Повертає map помилок { field: 'текст' | undefined }. Викликається на submit і після blur. */
  validate?: (values: T) => Errors<T>
  onSubmit: (values: T) => void | Promise<void>
}

// Власний легкий form-composable без залежностей.
// Реактивні values/errors/touched, валідація on-submit + on-blur, isSubmitting під час запиту.
export function useForm<T extends Record<string, any>>(opts: UseFormOptions<T>) {
  const values = reactive({ ...opts.initial }) as T
  const errors = ref<Errors<T>>({})
  const touched = ref<Partial<Record<keyof T, boolean>>>({})
  const isSubmitting = ref(false)

  function runValidate(): boolean {
    errors.value = opts.validate ? opts.validate(values) : {}
    return Object.values(errors.value).every((e) => !e)
  }

  const isValid = computed(() => Object.values(errors.value).every((e) => !e))

  function setFieldValue<K extends keyof T>(key: K, val: T[K]) {
    values[key] = val
    if (touched.value[key]) runValidate()
  }

  function handleBlur<K extends keyof T>(key: K) {
    touched.value[key] = true
    runValidate()
  }

  async function handleSubmit() {
    // позначаємо всі поля як touched, щоб показати всі помилки
    touched.value = Object.keys(values).reduce((acc, k) => {
      acc[k as keyof T] = true
      return acc
    }, {} as Partial<Record<keyof T, boolean>>)

    if (!runValidate()) return
    isSubmitting.value = true
    try {
      await opts.onSubmit(values)
    } finally {
      isSubmitting.value = false
    }
  }

  function reset() {
    Object.assign(values, opts.initial)
    errors.value = {}
    touched.value = {}
  }

  return { values, errors, touched, isSubmitting, isValid, setFieldValue, handleBlur, handleSubmit, reset }
}
