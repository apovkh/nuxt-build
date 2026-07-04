import { tValidation } from './messages'
import { getValidationRules } from './rules'

// Ready-made set of rules with bound messages. Usage: rules.required, rules.email …
export const rules = getValidationRules(tValidation)

export { tValidation } from './messages'
export type { TranslateFn, ValidationRule } from './rules'
