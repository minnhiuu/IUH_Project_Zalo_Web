import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { searchUserApi } from '../api/search-user.api'
import type { SearchEventRequest } from '../schemas/search.schema'
import { searchUsersInfiniteQueryOptions } from './options'

export const useSearchUser = (keyword: string, enabled = true) => {
  return useInfiniteQuery(searchUsersInfiniteQueryOptions(keyword, enabled))
}

export const useRecordSearchEvent = () => {
  return useMutation({
    mutationFn: (request: SearchEventRequest) => searchUserApi.recordEvent(request)
  })
}

export * from '../../recent/queries/use-recent-queries'
