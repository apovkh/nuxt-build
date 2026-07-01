// coreConfig — рантайм-дефолти ядра (поведінка запитів/кешу).
// НЕ для секретів/URL — ті йдуть у runtimeConfig. Auto-import: доступний глобально як `coreConfig`.
export const coreConfig = {
  http: {
    timeout: 30_000,
    retry: 1,
    retryDelay: 500,
  },
  query: {
    staleTime: 60_000, // проти double-fetch після SSR-гідрації
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  pollingInterval: 15_000, // дефолт для «живих» списків (refetchInterval)
} as const

export type CoreConfig = typeof coreConfig
