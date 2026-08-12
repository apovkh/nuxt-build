type Params = Record<string, any>

// Default validation messages. Easily swappable for vue-i18n later (t('$validation.<key>')).
const MESSAGES: Record<string, (p?: Params) => string> = {
  required: () => 'Обовʼязкове поле',
  requiredWithoutTrim: () => 'Обовʼязкове поле',
  agree: () => 'Потрібна згода',
  email: () => 'Некоректний email',
  emailTaken: () => 'Ця пошта вже зареєстрована',
  invalidCredentials: () => 'Невірний email або пароль',
  invalidResetToken: () => 'Посилання недійсне або застаріло. Запросіть нове.',
  phoneNumber: () => 'Некоректний номер телефону',
  maxLength: p => `Максимум ${p?.max} символів`,
  minLength: p => `Мінімум ${p?.min} символів`,
  minNumber: p => `Мінімум ${p?.min}`,
  maxNumber: p => `Максимум ${p?.max}`,
  minMaxNumber: p => `Від ${p?.min} до ${p?.max}`,
  twoDecimals: () => 'Не більше 2 знаків після коми',
  noDecimals: () => 'Тільки цілі числа',
  onlyUniqSymbols: () => 'Символи мають бути унікальними',
  unique: () => 'Таке значення вже додано',
}

// Positional parameter names for the 422 contract: the backend sends params as an array
// ([field, rule, [20]]), while the messages read named keys (p.max).
const POSITIONAL_PARAM_NAMES: Record<string, string[]> = {
  maxLength: ['max'],
  minLength: ['min'],
  minNumber: ['min'],
  maxNumber: ['max'],
  minMaxNumber: ['min', 'max'],
}

function toNamedParams(key: string, params: readonly (number | string)[]): Params {
  const names = POSITIONAL_PARAM_NAMES[key] ?? []

  return Object.fromEntries(names.map((name, index) => [name, params[index]]))
}

export function tValidation(
  key: string,
  params?: Params | readonly (number | string)[],
): string {
  const named = Array.isArray(params) ? toNamedParams(key, params) : params as Params | undefined

  return MESSAGES[key]?.(named) ?? 'Некоректне значення'
}
