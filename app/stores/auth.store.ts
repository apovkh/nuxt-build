export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string, name: string } | null>(null)
  const isLoggedIn = computed(() => user.value !== null)

  async function login(_credentials: { email: string, password: string }) {
    // const result = await AuthService.login(credentials)
    // user.value = result.user
  }

  function logout() {
    user.value = null
  }

  return { user, isLoggedIn, login, logout }
})
