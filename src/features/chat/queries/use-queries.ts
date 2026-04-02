import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { chatOptions } from './options'

export const useConversationsQuery = () => {
  return useQuery(chatOptions.conversations())
}

export const useMessagesInfiniteQuery = (conversationId: string) => {
  return useInfiniteQuery({
    ...chatOptions.messages(conversationId),
    enabled: !!conversationId
  })
}
