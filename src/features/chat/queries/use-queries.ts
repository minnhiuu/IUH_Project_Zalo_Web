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

export const useFriendsDirectory = (conversationId?: string | null, enabled: boolean = true) => {
  return useQuery({
    ...chatOptions.friendsDirectory(conversationId),
    enabled
  })
}

export const useSearchMembersInfinite = (query: string, conversationId?: string | null, enabled: boolean = true) => {
  return useInfiniteQuery({
    ...chatOptions.searchMembers(query, conversationId),
    enabled: enabled && !!query
  })
}
