import {
  VueQueryPlugin,
  QueryClient,
  hydrate,
  dehydrate,
  type DehydratedState,
  type VueQueryPluginOptions,
} from '@tanstack/vue-query'

// TanStack Query init + SSR-hydration. Дефолти беруться з coreConfig.query.
export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
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
