type Params = Record<string, any>

// Default validation messages. Easily swappable for vue-i18n later (t('$validation.<key>')).
const MESSAGES: Record<string, (p?: Params) => string> = {
  required: () => 'Required field',
  requiredWithoutTrim: () => 'Required field',
  agree: () => 'Consent is required',
  email: () => 'Invalid email',
  emailTaken: () => 'This email is already registered',
  invalidCredentials: () => 'Invalid email or password',
  invalidResetToken: () => 'The link is invalid or has expired. Request a new one.',
  phoneNumber: () => 'Invalid phone number',
  maxLength: p => `Maximum ${p?.max} characters`,
  minLength: p => `Minimum ${p?.min} characters`,
  minNumber: p => `Minimum ${p?.min}`,
  maxNumber: p => `Maximum ${p?.max}`,
  minMaxNumber: p => `From ${p?.min} to ${p?.max}`,
  twoDecimals: () => 'No more than 2 decimal places',
  noDecimals: () => 'Whole numbers only',
  onlyUniqSymbols: () => 'Characters must be unique',
  unique: () => 'This value has already been added',
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

  return MESSAGES[key]?.(named) ?? 'Invalid value'
}
