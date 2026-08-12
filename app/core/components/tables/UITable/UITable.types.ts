// Table headers — compatible with VDataTable headers.
export interface UITableHeader {
  key?: string
  title?: string
  value?: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: number | string
  minWidth?: string
  maxWidth?: string
  fixed?: boolean
  children?: UITableHeader[]
  [key: string]: any
}
