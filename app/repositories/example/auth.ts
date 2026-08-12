import { useHttp } from '~/core/composables/useHttp'

export interface LoginDto {
  login: string
  password: string
}

export interface LoginResult {
  token: string
}

// Repository = plain functions. Imported into a component and passed to useForm/useQuery.
export function login(body: LoginDto) {
  const http = useHttp()

  return http<LoginResult>('/auth/login', { method: 'POST', body })
}

export function logout() {
  const http = useHttp()

  return http('/auth/logout', { method: 'POST' })
}
