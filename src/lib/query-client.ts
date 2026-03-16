import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidatesQuery?: string[]
      message?: string
    }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  },
  mutationCache: new MutationCache({
    onSettled: (_data, _error, _variables, _context, mutation) => {
      if (mutation.meta?.invalidatesQuery) {
        queryClient.invalidateQueries({
          queryKey: mutation.meta.invalidatesQuery
        })
      }
      if (mutation.meta?.message && !mutation.state.error) {
        toast.success(mutation.meta.message)
      }
    }
  })
})
