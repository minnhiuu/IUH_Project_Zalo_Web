import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchUsersInfiniteQueryOptions, recentItemsQueryOptions, recentQueriesQueryOptions } from './options'
import { searchKeys } from './keys'
import { searchUserApi } from '../api/search-user.api'
import type { RecentSearchRequest } from '../schemas/search.schema'
import type { SearchType } from '@/constants/enum'

export const useSearchUser = (keyword: string, enabled = true) => {
  return useInfiniteQuery(searchUsersInfiniteQueryOptions(keyword, enabled))
}

export const useRecentItems = () => {
  return useQuery(recentItemsQueryOptions())
}

export const useRecentQueries = () => {
  return useQuery(recentQueriesQueryOptions())
}

export const useAddSearchItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecentSearchRequest) => searchUserApi.addSearchItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentItems() })
      queryClient.invalidateQueries({ queryKey: searchKeys.recentQueries() })
    }
  })
}

export const useRemoveSearchItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: SearchType }) => searchUserApi.removeItem(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentItems() })
      queryClient.invalidateQueries({ queryKey: searchKeys.recentQueries() })
    }
  })
}

export const useClearAllSearchHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => searchUserApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentItems() })
      queryClient.invalidateQueries({ queryKey: searchKeys.recentQueries() })
    }
  })
}
