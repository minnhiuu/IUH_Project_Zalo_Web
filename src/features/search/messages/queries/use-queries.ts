import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { messageSearchOptions } from './options'
import type { MessageSearchRequest, MessageSearchSection } from '../schemas/message-search.schema'

const hasSearchFilters = (request: MessageSearchRequest) =>
  !!request.conversationId && (!!request.keyword || !!request.senderId || !!request.from || !!request.to || !!request.dateRange)

export const useMessageSearchInfinite = (
  request: MessageSearchRequest,
  section: MessageSearchSection,
  enabled = true
) => {
  return useInfiniteQuery({
    ...messageSearchOptions.results(request, section),
    enabled: enabled && hasSearchFilters(request)
  })
}

export const useMessageSearchOverview = (request: MessageSearchRequest, sectionSize = 5, enabled = true) => {
  return useQuery({
    ...messageSearchOptions.overview(request, sectionSize),
    enabled: enabled && hasSearchFilters(request)
  })
}
