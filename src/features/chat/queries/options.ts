import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import {
  getConversations,
  getMessages,
  getFriendsDirectory,
  getGroupMembersApi,
  getPinsApi,
  getGroupAdminsApi,
  getAdminCandidatesApi,
  searchMembersToAdd,
  getJoinPreviewApi,
  getBlockedMembersApi,
  getBlockCandidatesApi,
  getMyGroupConversationsApi,
  getMessagesV2,
  getConversationParticipantsApi,
  type GroupSortOption,
  type GroupFilterOption
} from '../api/chat.api'
import type { PageResponse } from '@/shared/api'
import { chatKeys } from './keys'
import { QUERY_POLICIES } from '@/constants/query-policies'
import type { MessageResponse, MessageCursorParams, CursorPageResponse } from '../schemas/chat.schema'

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
  // conversationId = MongoDB ObjectId của room (thay vì recipientId)
  messages: (conversationId: string) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.legacyMessages(conversationId),
      queryFn: async ({ pageParam = 0 }) => {
        const response = await getMessages(conversationId, pageParam as number)
        return response
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: PageResponse<MessageResponse>) => {
        if (lastPage.page < lastPage.totalPages - 1) {
          return lastPage.page + 1
        }
        return undefined
      }
    }),
  messagesV2: (conversationId: string, jumpTargetId?: string | null) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.messages(conversationId),
      queryFn: ({ pageParam }) => getMessagesV2(conversationId, pageParam as MessageCursorParams),
      initialPageParam: (jumpTargetId
        ? { limit: 20, aroundMessageId: jumpTargetId }
        : { limit: 20, direction: 'OLDER', cursor: null }) as MessageCursorParams,
      getNextPageParam: (lastPage: CursorPageResponse<MessageResponse>): MessageCursorParams | undefined =>
        lastPage.hasMoreOlder ? { cursor: lastPage.olderCursor, direction: 'OLDER', limit: 20 } : undefined,
      getPreviousPageParam: (firstPage: CursorPageResponse<MessageResponse>): MessageCursorParams | undefined =>
        firstPage.hasMoreNewer ? { cursor: firstPage.newerCursor, direction: 'NEWER', limit: 20 } : undefined
    }),
  friendsDirectory: (conversationId?: string | null) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.friendsDirectory(conversationId),
      queryFn: () => getFriendsDirectory(conversationId)
    }),
  searchMembers: (query: string, conversationId?: string | null, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.searchMembers(query, conversationId),
      queryFn: ({ pageParam = 0 }) => searchMembersToAdd(query, pageParam as number, size, conversationId),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      enabled: !!query
    }),
  groupMembers: (conversationId: string, query: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.groupMembers(conversationId, query),
      queryFn: ({ pageParam = 0 }) => getGroupMembersApi(conversationId, { query, page: pageParam as number, size }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      enabled: !!conversationId
    }),
  pins: (conversationId: string) =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.pins(conversationId),
      queryFn: () => getPinsApi(conversationId),
      enabled: !!conversationId
    }),
  groupAdmins: (conversationId: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.groupAdmins(conversationId),
      queryFn: ({ pageParam = 0 }) => getGroupAdminsApi(conversationId, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      enabled: !!conversationId
    }),
  adminCandidates: (conversationId: string, query: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.adminCandidates(conversationId, query),
      queryFn: ({ pageParam = 0 }) => getAdminCandidatesApi(conversationId, query, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      enabled: !!conversationId
    }),
  joinPreview: (token: string) =>
    queryOptions({
      queryKey: chatKeys.joinPreview(token),
      queryFn: () => getJoinPreviewApi(token),
      staleTime: 5000,
      enabled: !!token
    }),
  blockedMembers: (conversationId: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.blockedMembers(conversationId),
      queryFn: ({ pageParam = 0 }) => getBlockedMembersApi(conversationId, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      enabled: !!conversationId
    }),
  blockCandidates: (conversationId: string, query: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.blockCandidates(conversationId, query),
      queryFn: ({ pageParam = 0 }) => getBlockCandidatesApi(conversationId, query, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      enabled: !!conversationId
    }),
  myGroups: (query: string, sort: GroupSortOption, filter: GroupFilterOption, page: number, size = 20) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.myGroups(query, sort, filter, page),
      queryFn: () => getMyGroupConversationsApi({ query, sort, filter, page, size })
    }),
  conversationParticipants: (conversationId: string, query: string, size = 50) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: chatKeys.conversationParticipants(conversationId, query),
      queryFn: ({ pageParam = 0 }) =>
        getConversationParticipantsApi(conversationId, { query, page: pageParam as number, size }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      enabled: !!conversationId
    })
}
