import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import {
  getConversations,
  getMessages,
  getFriendsDirectory,
  getGroupMembersApi,
  getGroupAdminsApi,
  getAdminCandidatesApi,
  searchMembersToAdd,
  getJoinPreviewApi
} from '../api/chat.api'
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
  // conversationId = MongoDB ObjectId của room (thay vì recipientId)
  messages: (conversationId: string) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: chatKeys.messages(conversationId),
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
    })
}
