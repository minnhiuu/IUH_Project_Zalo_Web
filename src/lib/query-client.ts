import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

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
    onError: (error) => {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    },
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
