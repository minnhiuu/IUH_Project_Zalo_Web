import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recentHistoryQueryOptions } from './options'
import { recentSearchKeys } from './keys'
import { recentSearchApi } from '../api/recent-search.api'
import type { RecentSearchRequest, RecentSearchResponse, RecentHistoryResponse } from '../schemas/recent-search.schema'
import { SearchType } from '@/constants/enum'

export const useRecentHistory = () => {
  return useQuery(recentHistoryQueryOptions())
}

export const useAddSearchItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecentSearchRequest) => recentSearchApi.addSearchItem(data),
    onMutate: async (newItem) => {
      const historyKey = recentSearchKeys.history()
      await queryClient.cancelQueries({ queryKey: historyKey })

      const previousHistory = queryClient.getQueryData<RecentHistoryResponse>(historyKey)
      const optimisticItem = { ...newItem, timestamp: Date.now() } as RecentSearchResponse

      if (previousHistory) {
        const isKeyword = newItem.type === SearchType.Keyword
        const updatedItems = !isKeyword
          ? [optimisticItem, ...previousHistory.items.filter((i) => i.id !== newItem.id)].slice(0, 15)
          : previousHistory.items
        const updatedQueries = isKeyword
          ? [optimisticItem, ...previousHistory.queries.filter((i) => i.id !== newItem.id)].slice(0, 15)
          : previousHistory.queries

        queryClient.setQueryData(historyKey, { items: updatedItems, queries: updatedQueries })
      }

      return { previousHistory, historyKey }
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(context.historyKey, context.previousHistory)
      }
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.historyKey) {
        queryClient.invalidateQueries({ queryKey: context.historyKey })
      }
    }
  })
}

export const useRemoveSearchItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: SearchType }) => recentSearchApi.removeItem(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recentSearchKeys.history() })
    }
  })
}

export const useClearAllSearchHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => recentSearchApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recentSearchKeys.history() })
    }
  })
}
