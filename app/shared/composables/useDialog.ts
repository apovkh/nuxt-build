// Global dialog registry.
interface DialogEntry {
  id: string
  component: unknown
  props: Record<string, unknown>
}

const dialogs = ref<DialogEntry[]>([])

export function useDialog() {
  function open(component: unknown, props: Record<string, unknown> = {}) {
    const id = crypto.randomUUID()
    dialogs.value.push({ id, component, props })

    return id
  }

  function close(id: string) {
    dialogs.value = dialogs.value.filter(d => d.id !== id)
  }

  return { dialogs: readonly(dialogs), open, close }
}
