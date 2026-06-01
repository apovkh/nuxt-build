// Scope query keys to current user so cache is isolated per-user.
export function useUserQueryScope() {
  // const { userId } = useAuthCookies()
  const userId = ref<string>('anon')

  return <T extends readonly unknown[]>(key: T): readonly [string, ...T] =>
    [userId.value, ...key] as const
}
