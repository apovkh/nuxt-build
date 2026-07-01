import {
  VueQueryPlugin,
  QueryClient,
  QueryCache,
  MutationCache,
  hydrate,
  dehydrate,
  type DehydratedState,
  type VueQueryPluginOptions,
} from '@tanstack/vue-query'
import { handleGlobalApiError } from '~/core/utils/handleApiError'

// TanStack Query init + SSR-hydration + ГЛОБАЛЬНА обробка помилок.
// Усі запити/мутації (use*Query, useApiMutation) автоматично проходять через handleGlobalApiError.
// Щоб замовкнути конкретний запит — передай meta: { silent: true } у його опції.
export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryCache = new QueryCache({
    onError: (error, query) => {
      handleGlobalApiError(error, { silent: Boolean(query.meta?.silent) })
    },
  })

  const mutationCache = new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      handleGlobalApiError(error, { silent: Boolean(mutation.options.meta?.silent) })
    },
  })

  const queryClient = new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: { queries: { ...coreConfig.query } },
  })

  nuxt.vueApp.use(VueQueryPlugin, { queryClient } as VueQueryPluginOptions)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }
  if (import.meta.client) {
    hydrate(queryClient, vueQueryState.value)
  }
})
