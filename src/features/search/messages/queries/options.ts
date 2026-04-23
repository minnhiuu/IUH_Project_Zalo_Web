import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { searchMessagesApi, searchMessagesOverviewApi } from '../api/message-search.api'
import { messageSearchKeys } from './keys'
import type { MessageSearchRequest, MessageSearchSection } from '../schemas/message-search.schema'

export const messageSearchOptions = {
  results: (request: MessageSearchRequest, section: MessageSearchSection) =>
    infiniteQueryOptions({
      queryKey: messageSearchKeys.results(request, section),
      queryFn: ({ pageParam = 0 }) => searchMessagesApi(request, section, pageParam as number),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined)
    }),

  overview: (request: MessageSearchRequest, sectionSize: number) =>
    queryOptions({
      queryKey: messageSearchKeys.overview(request, sectionSize),
      queryFn: () => searchMessagesOverviewApi(request, sectionSize)
    })
}
