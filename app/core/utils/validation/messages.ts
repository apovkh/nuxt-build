type Params = Record<string, any>

// Default validation messages. Easily swappable for vue-i18n later (t('$validation.<key>')).
const MESSAGES: Record<string, (p?: Params) => string> = {
  required: () => 'Обовʼязкове поле',
  requiredWithoutTrim: () => 'Обовʼязкове поле',
  agree: () => 'Потрібна згода',
  email: () => 'Некоректний email',
  phoneNumber: () => 'Некоректний номер телефону',
  maxLength: p => `Максимум ${p?.max} символів`,
  minLength: p => `Мінімум ${p?.min} символів`,
  minNumber: p => `Мінімум ${p?.min}`,
  maxNumber: p => `Максимум ${p?.max}`,
  minMaxNumber: p => `Від ${p?.min} до ${p?.max}`,
  twoDecimals: () => 'Не більше 2 знаків після коми',
  noDecimals: () => 'Тільки цілі числа',
  onlyUniqSymbols: () => 'Символи мають бути унікальними',
}

export function tValidation(key: string, params?: Params): string {
  return MESSAGES[key]?.(params) ?? 'Некоректне значення'
}
