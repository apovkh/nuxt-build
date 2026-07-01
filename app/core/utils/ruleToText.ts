// Перетворює правило валідації бекенду + параметри на людський текст.
// Розшир мапу під свій API. Ключ — назва правила, значення — функція від params.
const RULES: Record<string, (params: Array<number | string>) => string> = {
  required: () => 'Обовʼязкове поле',
  email: () => 'Некоректний email',
  min: (p) => `Мінімум ${p[0]}`,
  max: (p) => `Максимум ${p[0]}`,
  unique: () => 'Вже зайнято',
  confirmed: () => 'Значення не збігаються',
}

export function ruleToText(rule: string, params: Array<number | string> = []): string {
  return RULES[rule]?.(params) ?? 'Некоректне значення'
}
