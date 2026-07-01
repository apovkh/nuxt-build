import type { $Fetch } from 'ofetch'

// Доступ до транспорту ядра ($http — raw fetch з інтерсепторами), який дає плагін core/plugins/api.ts.
// Використовується всередині репозиторіїв, щоб компонент не тягнув useNuxtApp сам.
export function useHttp(): $Fetch {
  return useNuxtApp().$http
}
