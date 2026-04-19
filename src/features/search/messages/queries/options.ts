import { infiniteQueryOptions } from '@tanstack/react-query'
import { searchMessagesApi } from '../api/message-search.api'
import { messageSearchKeys } from './keys'
import type { MessageSearchRequest } from '../schemas/message-search.schema'

export const messageSearchOptions = {
  results: (request: MessageSearchRequest) => 
    infiniteQueryOptions({
      queryKey: messageSearchKeys.results(request),
      queryFn: ({ pageParam = 0 }) => searchMessagesApi(request, pageParam as number),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined)
    })
}
