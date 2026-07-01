import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/vue-query'

// Мутації (POST/PUT/PATCH/DELETE) + автоматична інвалідація кешу після успіху.
// invalidate — список queryKey, які треба оновити (напр. [['exams']]).
export function useApiMutation<TData, TVars>(
  options: UseMutationOptions<TData, Error, TVars> & { invalidate?: unknown[][] },
) {
  const qc = useQueryClient()
  return useMutation({
    ...options,
    onSuccess: (data, vars, ctx) => {
      options.invalidate?.forEach((key) => qc.invalidateQueries({ queryKey: key }))
      options.onSuccess?.(data, vars, ctx)
    },
  })
}
