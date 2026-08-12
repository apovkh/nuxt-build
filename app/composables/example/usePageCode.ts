import type { MaybeRefOrGetter } from 'vue'
import { toValue, watchEffect } from 'vue'

export interface CodeTab {
  title: string
  code: string
}

// Registers code for the layout's right column. Keyed by route, so nothing "sticks"
// between pages: the layout reads the code of the current path specifically.
export function usePageCode(tabs: MaybeRefOrGetter<CodeTab[]>) {
  const route = useRoute()
  const store = useState<Record<string, CodeTab[]>>('page-code', () => ({}))
  watchEffect(() => {
    store.value[route.path] = toValue(tabs)
  })
}
