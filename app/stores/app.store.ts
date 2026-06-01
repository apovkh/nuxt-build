export const useAppStore = defineStore('app', () => {
  const isBooted = ref(false)

  async function boot() {
    // await SomeService.boot()
    isBooted.value = true
  }

  return { isBooted, boot }
})
