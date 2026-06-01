import type { VNode } from 'vue'

export interface IExampleProps {
  modelValue: string
  variant?: 'default' | 'primary'
  disabled?: boolean
}

export interface IExampleEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'submit', value: string): void
}

export interface IExampleSlots {
  default?: (props: { value: string }) => VNode[]
  prepend?: () => VNode[]
  append?: () => VNode[]
}

export interface IExampleExpose {
  reset: () => void
  focus: () => void
}
