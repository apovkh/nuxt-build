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

// TanStack Query init + SSR hydration + GLOBAL error handling.
// All queries/mutations (use*Query, useApiMutation) automatically go through handleGlobalApiError.
// To silence a specific query — pass meta: { silent: true } in its options.
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
