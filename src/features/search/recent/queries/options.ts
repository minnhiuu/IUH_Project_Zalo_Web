import { queryOptions } from '@tanstack/react-query'
import { recentSearchApi } from '../api/recent-search.api'
import { recentSearchKeys } from './keys'

export const recentHistoryQueryOptions = () =>
  queryOptions({
    queryKey: recentSearchKeys.history(),
    queryFn: async () => {
      const response = await recentSearchApi.getRecentHistory()
      return response.data.data
    }
  })
