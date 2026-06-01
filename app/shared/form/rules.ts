// Vuetify-compatible validation rules. Each rule returns `true` or an error message.
// Used as `:rules="[required(), minLength(3)]"` on inputs and `AValidation`.

export type Rule<T = unknown> = (value: T) => true | string

export function required(message = 'Required'): Rule {
  return v => (v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) || message
}

export function minLength(min: number, message?: string): Rule<string> {
  return v => (typeof v === 'string' && v.length >= min) || message || `Must be at least ${min} characters`
}

export function maxLength(max: number, message?: string): Rule<string> {
  return v => (typeof v === 'string' && v.length <= max) || message || `Must be at most ${max} characters`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s.@]+$/
export function email(message = 'Invalid email'): Rule<string> {
  return v => !v || EMAIL_RE.test(v) || message
}

export function pattern(re: RegExp, message = 'Invalid format'): Rule<string> {
  return v => !v || re.test(v) || message
}

export function numeric(message = 'Must be a number'): Rule<unknown> {
  return v => !v || !Number.isNaN(Number(v)) || message
}
