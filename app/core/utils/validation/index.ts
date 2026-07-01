import { getValidationRules } from './rules'
import { tValidation } from './messages'

// Ready-made set of rules with bound messages. Usage: rules.required, rules.email …
export const rules = getValidationRules(tValidation)

export type { ValidationRule, TranslateFn } from './rules'
export { tValidation } from './messages'
