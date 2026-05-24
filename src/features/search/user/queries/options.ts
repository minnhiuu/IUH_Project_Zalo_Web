import { queryOptions, infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query'
import { searchUserApi } from '../api/search-user.api'
import { searchKeys } from './keys'


export const searchUsersQueryOptions = (keyword: string, enabled = true) =>

  queryOptions({
    queryKey: searchKeys.search(keyword),
    queryFn: async () => {
      const response = await searchUserApi.search(keyword)
      return response.data
    },
    enabled: enabled && !!keyword,
    placeholderData: keepPreviousData,
    select: (response) => response.data
  })

export const searchUsersInfiniteQueryOptions = (keyword: string, enabled = true) =>
  infiniteQueryOptions({
    queryKey: searchKeys.search(keyword),
    queryFn: async ({ pageParam }) => {
      const response = await searchUserApi.search(keyword, pageParam as number)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined
    },
    enabled: enabled && !!keyword,
    placeholderData: keepPreviousData
  })
