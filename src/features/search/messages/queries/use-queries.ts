import { useInfiniteQuery } from '@tanstack/react-query'
import { messageSearchOptions } from './options'
import type { MessageSearchRequest } from '../schemas/message-search.schema'

export const useMessageSearchInfinite = (request: MessageSearchRequest, enabled = true) => {
  return useInfiniteQuery({
    ...messageSearchOptions.results(request),
    enabled: enabled && !!request.conversationId && (!!request.keyword || !!request.senderId || !!request.from || !!request.to)
  })
}
