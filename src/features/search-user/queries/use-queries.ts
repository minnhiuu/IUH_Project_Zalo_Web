import { useInfiniteQuery } from '@tanstack/react-query'
import { searchUsersInfiniteQueryOptions } from './options'
import { useDebounce } from '@/hooks/use-debounce'

export const useSearchUser = (keyword: string, enabled = true) => {
  const debouncedKeyword = useDebounce(keyword, 500)
  return useInfiniteQuery(searchUsersInfiniteQueryOptions(debouncedKeyword, enabled))
}
