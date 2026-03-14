import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { chatApi } from '../api/chat.api'
import { chatKeys } from './keys'
import { QUERY_POLICIES } from '@/constants/query-policies'
import type { MessageResponse } from '../schemas/chat.schema'

export const chatOptions = {
  conversations: () =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.conversations(),
      queryFn: async () => {
        const response = await chatApi.getConversations()
        // Handle properly wrapped PageResponse from Backend
        const innerData = response.data?.data as any
        if (innerData && Array.isArray(innerData.data)) {
            return innerData.data
        }
        return Array.isArray(innerData) ? innerData : []
      }
    }),
  messages: (recipientId: string) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.messages(recipientId),
      queryFn: async ({ pageParam = 0 }) => {
        const response = await chatApi.getMessages(recipientId, pageParam as number)
        const innerData = response.data?.data as any
        
        // If backend flattens PageResponse directly into an Array
        if (Array.isArray(innerData)) {
          return {
            data: innerData as MessageResponse[],
            page: pageParam as number,
            totalPages: innerData.length < 20 ? (pageParam as number) + 1 : (pageParam as number) + 2,
          }
        }
        return innerData || { data: [], page: 0, totalPages: 0 } // Fallback if it correctly returns PageResponse object or is empty
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages - 1) {
          return lastPage.page + 1
        }
        return undefined
      }
    })
}
