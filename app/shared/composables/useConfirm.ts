// Stub composable — wire to ADialog-based registry.
export function useConfirm() {
  return async (_opts: { title: string, message: string }) =>
    // eslint-disable-next-line no-alert
    window.confirm(_opts.message)
}

export function useDangerConfirm() {
  return useConfirm()
}

export function useDialogConfirm() {
  return useConfirm()
}

export function useDialogReturnData<T = unknown>() {
  return async (): Promise<T | null> => null
}
