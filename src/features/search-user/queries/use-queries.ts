import { useInfiniteQuery } from '@tanstack/react-query'
import { searchUsersInfiniteQueryOptions } from './options'

export const useSearchUser = (keyword: string, enabled = true) => {
  return useInfiniteQuery(searchUsersInfiniteQueryOptions(keyword, enabled))
}
