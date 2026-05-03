import { useInfiniteQuery } from '@tanstack/react-query'
import { searchUsersInfiniteQueryOptions } from './options'

export const useSearchUser = (keyword: string, enabled = true) => {
  return useInfiniteQuery(searchUsersInfiniteQueryOptions(keyword, enabled))
}

export * from '../../recent/queries/use-recent-queries'
