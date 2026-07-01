import type { $Fetch } from 'ofetch'

// Access to the core transport ($http — raw fetch with interceptors) provided by the core/plugins/api.ts plugin.
// Used inside repositories so a component doesn't have to call useNuxtApp itself.
export function useHttp(): $Fetch {
  return useNuxtApp().$http
}
