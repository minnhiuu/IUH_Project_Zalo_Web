import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { getConversations, getMessages } from '../api/chat.api'
import type { PageResponse } from '@/shared/api'
import { chatKeys } from './keys'
import { QUERY_POLICIES } from '@/constants/query-policies'
import type { MessageResponse } from '../schemas/chat.schema'

export const chatOptions = {
  conversations: () =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.conversations(),
      queryFn: async () => {
        const pageResponse = await getConversations()
        return pageResponse.data
      }
    }),
  messages: (recipientId: string) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.messages(recipientId),
      queryFn: async ({ pageParam = 0 }) => {
        const response = await getMessages(recipientId, pageParam as number)
        return response
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: PageResponse<MessageResponse>) => {
        if (lastPage.page < lastPage.totalPages - 1) {
          return lastPage.page + 1
        }
        return undefined
      }
    })
}
