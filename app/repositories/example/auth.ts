import { useHttp } from '~/core/composables/useHttp'

export interface LoginDto {
  login: string
  password: string
}

export interface LoginResult {
  token: string
}

// Репозиторій = прямі функції. Імпортуються в компонент і передаються у useForm/useQuery.
export function login(body: LoginDto) {
  const http = useHttp()

  return http<LoginResult>('/auth/login', { method: 'POST', body })
}

export function logout() {
  const http = useHttp()

  return http('/auth/logout', { method: 'POST' })
}
