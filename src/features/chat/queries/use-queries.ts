import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { chatOptions } from './options'
import { chatKeys } from './keys'
import { getMediaMessagesApi } from '../api/chat.api'
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

export const useMediaMessagesQuery = (
  conversationId: string | undefined,
  types: string[],
  page = 0,
  size = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: chatKeys.media(conversationId || '', types),
    queryFn: () => getMediaMessagesApi(conversationId!, types, page, size),
    enabled: enabled && !!conversationId && types.length > 0
  })
}

export const useGroupAdminsInfiniteQuery = (conversationId: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    ...chatOptions.groupAdmins(conversationId),
    enabled: enabled && !!conversationId
  })
}

export const useAdminCandidatesInfiniteQuery = (conversationId: string, query: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    ...chatOptions.adminCandidates(conversationId, query),
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

export const useBlockedMembersInfiniteQuery = (conversationId: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    ...chatOptions.blockedMembers(conversationId),
    enabled: enabled && !!conversationId
  })
}

export const useBlockCandidatesInfiniteQuery = (conversationId: string, query: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    ...chatOptions.blockCandidates(conversationId, query),
    enabled: enabled && !!conversationId
  })
}
