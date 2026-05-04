import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { chatOptions } from './options'
import { chatKeys } from './keys'
import { getMediaMessagesApi, getSeenMembersApi, getUnreadAnchorApi, getJoinRequestsApi, getMessageApi } from '../api/chat.api'
import type { JoinRequestResponse } from '../schemas/chat.schema'
import type { GroupSortOption, GroupFilterOption } from '../api/chat.api'

export const useConversationsQuery = (enabled: boolean = true) => {
  return useQuery({
    ...chatOptions.conversations(),
    enabled
  })
}

export const useMessagesInfiniteQuery = (conversationId: string, jumpTargetId?: string | null) => {
  return useInfiniteQuery({
    ...chatOptions.messagesV2(conversationId, jumpTargetId),
    enabled: !!conversationId
  })
}

export const useChatMessagesV2 = (conversationId: string) => {
  return useInfiniteQuery({
    ...chatOptions.messagesV2(conversationId),
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
  const isFake = !!conversationId?.startsWith('fake_')
  return useQuery({
    queryKey: chatKeys.media(conversationId || '', types),
    queryFn: () => getMediaMessagesApi(conversationId!, types, page, size),
    enabled: enabled && !!conversationId && !isFake && types.length > 0
  })
}

export const usePinsQuery = (conversationId: string) => {
  return useQuery(chatOptions.pins(conversationId))
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

export const useMyGroupsQuery = (
  query: string,
  sort: GroupSortOption,
  filter: GroupFilterOption,
  page: number,
  size = 20,
  enabled = true
) => {
  return useQuery({
    ...chatOptions.myGroups(query, sort, filter, page, size),
    enabled
  })
}

export const useSeenMembersQuery = (conversationId: string, messageId: string, enabled: boolean) => {
  return useQuery({
    queryKey: chatKeys.seenMembers(conversationId, messageId),
    queryFn: () => getSeenMembersApi(conversationId, messageId),
    enabled: enabled && !!conversationId && !!messageId,
    staleTime: 10_000
  })
}

export const useUnreadAnchorQuery = (conversationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: chatKeys.unreadAnchor(conversationId),
    queryFn: () => getUnreadAnchorApi(conversationId),
    enabled: enabled && !!conversationId,
    staleTime: 10_000,
    gcTime: 30_000
  })
}

export const useConversationParticipantsInfinite = (conversationId: string, query: string, enabled = true) => {
  return useInfiniteQuery({
    ...chatOptions.conversationParticipants(conversationId, query),
    enabled: enabled && !!conversationId
  })
}

export const useMessageQuery = (messageId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['message', messageId],
    queryFn: () => getMessageApi(messageId),
    enabled: enabled && !!messageId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}
