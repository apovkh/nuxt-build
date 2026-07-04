import type { MaybeRefOrGetter } from 'vue'
import { toValue, watchEffect } from 'vue'

export interface CodeTab {
  title: string
  code: string
}

// Реєструє код для правої колонки layout. Ключується по маршруту, тож між сторінками
// нічого не «залипає»: layout читає код саме поточного шляху.
export function usePageCode(tabs: MaybeRefOrGetter<CodeTab[]>) {
  const route = useRoute()
  const store = useState<Record<string, CodeTab[]>>('page-code', () => ({}))
  watchEffect(() => {
    store.value[route.path] = toValue(tabs)
  })
}
