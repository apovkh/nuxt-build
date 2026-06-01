import type { $Fetch, FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'

export class ApiValidationError extends Error {
  constructor(public data: unknown) {
    super('API validation failed')
    this.name = 'ApiValidationError'
  }
}

interface CustomFetchOptions extends FetchOptions {
  customValidation?: (response: Response) => boolean
}

let _api: $Fetch | null = null

export function useApi(): $Fetch {
  if (_api)
    return _api

  const config = useRuntimeConfig()
  // const { token, userId } = useAuthCookies()

  _api = ofetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options: _options }) {
      // _options.headers = {
      //   ..._options.headers,
      //   'X-Token': token.value,
      //   'X-Userid': userId.value,
      // }
    },
    onResponse({ response, options }) {
      const v = (options as CustomFetchOptions).customValidation

      if (v && !v(response))
        throw new ApiValidationError(response._data)
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // handleSessionExpired()
      }
    },
  })

  return _api
}
