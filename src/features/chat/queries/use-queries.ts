import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { chatOptions } from './options'
import { chatKeys } from './keys'
import { getJoinRequestsApi } from '../api/chat.api'
import type { JoinRequestResponse } from '../schemas/chat.schema'

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

export const useGroupMembersInfinite = (conversationId: string, query: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    ...chatOptions.groupMembers(conversationId, query),
    enabled: enabled && !!conversationId
  })
}

export const useJoinRequestsQuery = (conversationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: chatKeys.joinRequests(conversationId),
    queryFn: async () => {
      const res = await getJoinRequestsApi(conversationId)
      return res.data as JoinRequestResponse[]
    },
    enabled: enabled && !!conversationId
  })
}

export const useJoinPreviewQuery = (token: string, enabled: boolean = true) => {
  return useQuery({
    ...chatOptions.joinPreview(token),
    enabled: enabled && !!token
  })
}
