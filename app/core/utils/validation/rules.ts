export type TranslateFn = (key: string, params?: Record<string, any>) => string

// Validation rule: returns true (valid) or an error string. Compatible with Vuetify :rules.
export type ValidationRule = (v: unknown) => true | string

// A set of rules inspired by the shared version. Translation is injected via t().
export const getValidationRules = (t: TranslateFn) => {
  const required: ValidationRule = (v) => {
    if (v === null || v === undefined)
      return t('required')

    const value = String(v)

    return (value && value.trim().length > 0) || t('required')
  }

  const requiredWithoutTrim: ValidationRule = (v) => {
    if (v === null || v === undefined)
      return t('requiredWithoutTrim')

    return String(v).length > 0 || t('requiredWithoutTrim')
  }

  const agree: ValidationRule = v => Boolean(v) || t('agree')

  const maxLength = (max: number): ValidationRule => (v) => {
    if (v === null || v === undefined)
      return true

    return String(v).length <= max || t('maxLength', { max })
  }

  const minLength = (min: number): ValidationRule => (v) => {
    if (v === null || v === undefined)
      return true

    return String(v).length >= min || t('minLength', { min })
  }

  const onlyUniqSymbols: ValidationRule = (v) => {
    if (v === null || v === undefined)
      return true

    const value = String(v)

    return value.length === new Set(value).size || t('onlyUniqSymbols')
  }

  const phoneNumber: ValidationRule = (v) => {
    const value = String(v || '')

    if (!value)
      return true

    return /^\+?\d{7,15}$/.test(value) || t('phoneNumber')
  }

  const email: ValidationRule = (v) => {
    const value = String(v || '')

    if (!value)
      return true

    const atIndex = value.indexOf('@')
    const dotIndex = value.lastIndexOf('.')
    const isValid = atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < value.length - 1

    return isValid || t('email')
  }

  const minNumber = (min: number): ValidationRule => (v) => {
    if (v === null || v === undefined || v === '')
      return true

    const num = Number(v)

    if (Number.isNaN(num))
      return t('minNumber', { min })

    return num >= min || t('minNumber', { min })
  }

  const maxNumber = (max: number): ValidationRule => (v) => {
    if (v === null || v === undefined || v === '')
      return true

    const num = Number(v)

    if (Number.isNaN(num))
      return t('maxNumber', { max })

    return num <= max || t('maxNumber', { max })
  }

  const minMaxNumber = (min: number, max: number, required = true): ValidationRule => (v) => {
    if (!required && (v === null || v === undefined || v === ''))
      return true

    const num = Number(v)

    if (Number.isNaN(num))
      return t('minMaxNumber', { min, max })

    return (num >= min && num <= max) || t('minMaxNumber', { min, max })
  }

  const twoDecimals: ValidationRule = (v) => {
    const value = String(v || '')

    if (!value)
      return true

    return /^\d+(?:\.\d{0,2})?$/.test(value) || t('twoDecimals')
  }

  const noDecimals: ValidationRule = (v) => {
    const value = String(v || '')

    if (!value)
      return true

    return /^\d+$/.test(value) || t('noDecimals')
  }

  return {
    phoneNumber,
    email,
    required,
    requiredWithoutTrim,
    maxLength,
    minLength,
    minMaxNumber,
    onlyUniqSymbols,
    agree,
    minNumber,
    maxNumber,
    twoDecimals,
    noDecimals,
  }
}
