// coreConfig — core runtime defaults (request/cache behavior).
// NOT for secrets/URLs — those go in runtimeConfig. Auto-import: available globally as `coreConfig`.
export const coreConfig = {
  http: {
    timeout: 30_000,
    retry: 1,
    retryDelay: 500,
  },
  query: {
    staleTime: 60_000, // guards against a double-fetch after SSR hydration
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  pollingInterval: 15_000, // default for "live" lists (refetchInterval)
} as const

export type CoreConfig = typeof coreConfig
