import type { VForm } from 'vuetify/components'

export function useVForm() {
  const formRef = ref<InstanceType<typeof VForm> | null>(null)

  async function validateForm(): Promise<boolean> {
    if (!formRef.value)
      return false

    const { valid } = await formRef.value.validate()

    return valid
  }

  function resetForm() {
    formRef.value?.reset()
  }

  return { formRef, validateForm, resetForm }
}
