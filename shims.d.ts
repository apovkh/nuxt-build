import 'ofetch'

declare module 'ofetch' {
  export interface FetchOptions {
    customValidation?: (response: Response) => boolean
  }
}
