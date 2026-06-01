type NotifyType = 'success' | 'error' | 'info' | 'warning'

interface NotifyState {
  visible: boolean
  type: NotifyType
  message: string
}

const state = ref<NotifyState>({ visible: false, type: 'info', message: '' })

function show(type: NotifyType, message: string) {
  state.value = { visible: true, type, message }
}

function dismiss() {
  state.value = { ...state.value, visible: false }
}

export function useNotify() {
  return {
    state: readonly(state),
    dismiss,
    success: (m: string) => show('success', m),
    error: (m: string) => show('error', m),
    info: (m: string) => show('info', m),
    warning: (m: string) => show('warning', m),
  }
}
