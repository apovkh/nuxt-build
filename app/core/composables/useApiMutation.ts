import type { UseMutationOptions } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Mutations (POST/PUT/PATCH/DELETE) + automatic cache invalidation on success.
// invalidate — list of queryKeys to refresh (e.g. [['exams']]).
export function useApiMutation<TData, TVars>(
  options: UseMutationOptions<TData, Error, TVars> & { invalidate?: unknown[][] },
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    onSuccess: (data, vars, ctx) => {
      options.invalidate?.forEach(key => queryClient.invalidateQueries({ queryKey: key }))
      options.onSuccess?.(data, vars, ctx)
    },
  })
}
