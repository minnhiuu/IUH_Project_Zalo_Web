import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchUsersInfiniteQueryOptions, recentHistoryQueryOptions } from './options'
import { searchKeys } from './keys'
import { searchUserApi } from '../api/search-user.api'
import type { RecentSearchRequest, RecentSearchResponse, RecentHistoryResponse } from '../schemas/search.schema'
import { SearchType } from '@/constants/enum'

export const useSearchUser = (keyword: string, enabled = true) => {
  return useInfiniteQuery(searchUsersInfiniteQueryOptions(keyword, enabled))
}

export const useRecentHistory = () => {
  return useQuery(recentHistoryQueryOptions())
}

export const useAddSearchItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecentSearchRequest) => searchUserApi.addSearchItem(data),
    onMutate: async (newItem) => {
      const historyKey = searchKeys.recentHistory()
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
    mutationFn: ({ id, type }: { id: string; type: SearchType }) => searchUserApi.removeItem(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentHistory() })
    }
  })
}

export const useClearAllSearchHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => searchUserApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentHistory() })
    }
  })
}
