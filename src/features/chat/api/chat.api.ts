import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  ConversationResponse,
  MessageResponse,
  ChatMessageRequest,
  GroupConversationCreateRequest,
  LeaveGroupRequest,
  SearchMemberResponse,
  GroupMemberListItemResponse,
  ConversationParticipantResponse,
  AdminMemberResponse,
  GroupSettings,
  JoinGroupPreviewResponse,
  PinnedMessageInfo,
  JoinRequestResponse,
  MessageCursorParams,
  CursorPageResponse
} from '../schemas/chat.schema'
import type { UserSummaryResponse } from '@/shared/user/user-summary'

export const getConversations = async (page = 0, size = 20): Promise<PageResponse<ConversationResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<ConversationResponse>>>('/messages/conversations', {
    params: { page, size }
  })
  return response.data.data
}

export const getQuickConversations = async (size = 3): Promise<UserSummaryResponse[]> => {
  const response = await http.get<ApiResponse<UserSummaryResponse[]>>('/messages/conversations/quick', {
    params: { size }
  })
  return response.data.data
}

/**
 * Lấy hoặc tạo phòng chat 1-1 với partner.
 * Gọi trước khi mở chat để có được conversationId (ObjectId).
 */
export const getOrCreateConversation = async (partnerId: string): Promise<ConversationResponse> => {
  const response = await http.get<ApiResponse<ConversationResponse>>(`/messages/conversations/partner/${partnerId}`)
  return response.data.data
}

export const createGroupConversation = async (
  request: GroupConversationCreateRequest
): Promise<ConversationResponse> => {
  const response = await http.post<ApiResponse<ConversationResponse>>('/messages/conversations/groups', request)
  return response.data.data
}

export const sendGroupInvitesApi = async (conversationId: string, userIds: string[]): Promise<void> => {
  await http.post(`/messages/conversations/groups/${conversationId}/invites`, { userIds })
}

/**
 * Lấy tin nhắn theo conversationId (MongoDB ObjectId).
 * Endpoint mới: /messages/conversations/{conversationId}/messages
 */
export const getMessages = async (
  conversationId: string,
  page = 0,
  size = 20
): Promise<PageResponse<MessageResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<MessageResponse>>>(
    `/messages/conversations/${conversationId}/messages`,
    { params: { page, size } }
  )
  return response.data.data
}

export const getMessagesV2 = async (
  conversationId: string,
  params: MessageCursorParams
): Promise<CursorPageResponse<MessageResponse>> => {
  const response = await http.get<ApiResponse<CursorPageResponse<MessageResponse>>>(
    `/messages/v2/conversations/${conversationId}/messages`,
    { params }
  )
  return response.data.data
}

export const markAsRead = async (conversationId: string, lastReadMessageId?: string): Promise<void> => {
  await http.put(
    `/messages/conversations/${conversationId}/read`,
    lastReadMessageId ? { lastReadMessageId } : undefined
  )
}

export interface UnreadAnchorResponse {
  firstUnreadMessageId: string | null
  unreadCount: number
}

export const getUnreadAnchorApi = async (conversationId: string): Promise<UnreadAnchorResponse> => {
  const response = await http.get<ApiResponse<UnreadAnchorResponse>>(
    `/messages/conversations/${conversationId}/unread-anchor`
  )
  return response.data.data
}

export const getMediaMessagesApi = async (
  conversationId: string,
  types: string[],
  page = 0,
  size = 20
): Promise<PageResponse<MessageResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<MessageResponse>>>(
    `/messages/conversations/${conversationId}/media`,
    { params: { types: types.join(','), page, size } }
  )
  return response.data.data
}

export const sendMessageApi = async (data: ChatMessageRequest): Promise<void> => {
  const { conversationId, ...requestBody } = data
  await http.post(`/messages/conversations/${conversationId}/messages`, requestBody)
}

// ────────────────────────────────────────────────────────────────
// File Upload → S3 via file-service
// ────────────────────────────────────────────────────────────────
export interface FileUploadResult {
  key: string
  url: string
  fileName: string
  originalFileName: string
  contentType: string
  size: number
}

export interface PresignFileRequest {
  fileName: string
  contentType: string
  size: number
  folder: string
}

export interface PresignedUploadResponse {
  key: string
  presignedUrl: string
  publicUrl: string
  contentType: string
  originalFileName: string
  size: number
  expiresAt: string
}

export const uploadFileApi = async (file: File, folder: string): Promise<FileUploadResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await http.post<ApiResponse<FileUploadResult>>('/files/upload', formData, {
    params: { folder },
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data.data
}

export const getBatchPresignedUrls = async (requests: PresignFileRequest[]): Promise<PresignedUploadResponse[]> => {
  const response = await http.post<ApiResponse<PresignedUploadResponse[]>>('/files/presign/batch', requests)
  return response.data.data
}

export const revokeMessageApi = async (messageId: string): Promise<void> => {
  await http.patch(`/messages/messages/${messageId}/revoke`)
}

export const getMessageApi = async (messageId: string): Promise<MessageResponse> => {
  const response = await http.get<ApiResponse<MessageResponse>>(`/messages/messages/${messageId}`)
  return response.data.data
}

export const deleteMessageForMeApi = async (messageId: string): Promise<void> => {
  await http.delete(`/messages/messages/${messageId}/me`)
}

export const deleteGroupMemberMessageApi = async (conversationId: string, messageId: string): Promise<void> => {
  await http.delete(`/messages/conversations/${conversationId}/messages/${messageId}/admin`)
}

export const toggleReactionApi = async (messageId: string, emoji: string): Promise<void> => {
  await http.post(`/messages/messages/${messageId}/reactions`, { emoji })
}

export const removeAllMyReactionsApi = async (messageId: string): Promise<void> => {
  await http.delete(`/messages/messages/${messageId}/reactions/me`)
}

export interface MessageSeenResponse {
  userId: string
  fullName: string | null
  avatar: string | null
}

export const getSeenMembersApi = async (conversationId: string, messageId: string): Promise<MessageSeenResponse[]> => {
  const response = await http.get<ApiResponse<MessageSeenResponse[]>>(
    `/messages/conversations/${conversationId}/messages/${messageId}/seen-members`
  )
  return response.data.data
}

export const updateGroupNameApi = async (conversationId: string, name: string): Promise<ConversationResponse> => {
  const response = await http.patch<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/name`,
    null,
    { params: { name } }
  )
  return response.data.data
}

export const updateGroupAvatarApi = async (conversationId: string, file: File): Promise<ConversationResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await http.patch<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/avatar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data.data
}

export const disbandGroupApi = async (conversationId: string): Promise<void> => {
  await http.delete(`/messages/conversations/${conversationId}/groups`)
}

export const deleteConversationApi = async (conversationId: string): Promise<void> => {
  await http.delete(`/messages/conversations/${conversationId}`)
}

export const leaveGroupApi = async (conversationId: string, request: LeaveGroupRequest): Promise<void> => {
  await http.delete(`/messages/conversations/${conversationId}/leave`, {
    data: request
  })
}

export const getFriendsDirectory = async (
  conversationId?: string | null
): Promise<Record<string, SearchMemberResponse[]>> => {
  const response = await http.get<ApiResponse<Record<string, SearchMemberResponse[]>>>(
    '/messages/conversations/friends-directory',
    { params: { conversationId } }
  )
  return response.data.data
}

export const searchMembersToAdd = async (
  query: string,
  page = 0,
  size = 20,
  conversationId?: string | null
): Promise<PageResponse<SearchMemberResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<SearchMemberResponse>>>(
    '/messages/conversations/search-members',
    { params: { query, page, size, conversationId } }
  )
  return response.data.data
}

export const addMembersToGroupApi = async (
  conversationId: string,
  memberIds: string[]
): Promise<ConversationResponse> => {
  const response = await http.post<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/members`,
    { memberIds }
  )
  return response.data.data
}

export const getGroupMembersApi = async (
  conversationId: string,
  params?: {
    query?: string
    page?: number
    size?: number
  }
): Promise<PageResponse<GroupMemberListItemResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<GroupMemberListItemResponse>>>(
    `/messages/conversations/${conversationId}/group-members`,
    {
      params: {
        query: params?.query,
        page: params?.page ?? 0,
        size: params?.size ?? 20
      }
    }
  )
  return response.data.data
}

export const getConversationParticipantsApi = async (
  conversationId: string,
  params?: {
    query?: string
    page?: number
    size?: number
  }
): Promise<PageResponse<ConversationParticipantResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<ConversationParticipantResponse>>>(
    `/messages/conversations/${conversationId}/participants`,
    {
      params: {
        query: params?.query,
        page: params?.page ?? 0,
        size: params?.size ?? 50
      }
    }
  )
  return response.data.data
}

export const removeMemberFromGroupApi = async (
  conversationId: string,
  targetUserId: string,
  blockFromGroup = false
): Promise<ConversationResponse> => {
  const response = await http.delete<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/members/${targetUserId}`,
    { params: { blockFromGroup } }
  )
  return response.data.data
}

export const promoteToAdminApi = async (
  conversationId: string,
  targetUserId: string
): Promise<ConversationResponse> => {
  const response = await http.patch<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/members/${targetUserId}/promote`
  )
  return response.data.data
}

export const demoteFromAdminApi = async (
  conversationId: string,
  targetUserId: string
): Promise<ConversationResponse> => {
  const response = await http.patch<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/members/${targetUserId}/demote`
  )
  return response.data.data
}

export const transferOwnerApi = async (conversationId: string, targetUserId: string): Promise<ConversationResponse> => {
  const response = await http.patch<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/transfer-owner/${targetUserId}`
  )
  return response.data.data
}

export const getGroupAdminsApi = async (
  conversationId: string,
  page = 0,
  size = 20
): Promise<PageResponse<AdminMemberResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<AdminMemberResponse>>>(
    `/messages/conversations/${conversationId}/group-admins`,
    { params: { page, size } }
  )
  return response.data.data
}

export const getAdminCandidatesApi = async (
  conversationId: string,
  query?: string,
  page = 0,
  size = 20
): Promise<PageResponse<AdminMemberResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<AdminMemberResponse>>>(
    `/messages/conversations/${conversationId}/admin-candidates`,
    { params: { query, page, size } }
  )
  return response.data.data
}

export const updateGroupSettingsApi = async (
  conversationId: string,
  settings: Partial<GroupSettings>
): Promise<ConversationResponse> => {
  const response = await http.patch<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/settings`,
    settings
  )
  return response.data.data
}

export const refreshJoinLinkApi = async (conversationId: string): Promise<string> => {
  const response = await http.post<ApiResponse<string>>(`/messages/conversations/${conversationId}/join-link/refresh`)
  return response.data.data
}

export const generateJoinLinkApi = async (conversationId: string): Promise<string> => {
  const response = await http.post<ApiResponse<string>>(`/messages/conversations/${conversationId}/join-link`)
  return response.data.data
}

export const joinByLinkApi = async (token: string, joinAnswer?: string): Promise<ConversationResponse> => {
  const response = await http.post<ApiResponse<ConversationResponse>>(`/messages/conversations/join/${token}`, {
    joinAnswer
  })
  return response.data.data
}

export const updateJoinQuestionApi = async (conversationId: string, question: string): Promise<void> => {
  await http.put(`/messages/conversations/${conversationId}/join-question`, { question })
}

export const getJoinPreviewApi = async (token: string): Promise<JoinGroupPreviewResponse> => {
  const response = await http.get<ApiResponse<JoinGroupPreviewResponse>>(
    `/messages/conversations/join/${token}/preview`
  )
  return response.data.data
}

export const getJoinRequestsApi = async (
  conversationId: string,
  page = 0,
  size = 20
): Promise<PageResponse<JoinRequestResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<JoinRequestResponse>>>(
    `/messages/conversations/${conversationId}/join-requests`,
    { params: { page, size } }
  )
  return response.data.data
}

export const approveJoinRequestApi = async (
  conversationId: string,
  requestId: string
): Promise<ConversationResponse> => {
  const response = await http.post<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/join-requests/${requestId}/approve`
  )
  return response.data.data
}

export const rejectJoinRequestApi = async (conversationId: string, requestId: string): Promise<void> => {
  await http.post(`/messages/conversations/${conversationId}/join-requests/${requestId}/reject`)
}

export const cancelMyJoinRequestApi = async (conversationId: string): Promise<void> => {
  await http.delete(`/messages/conversations/${conversationId}/join-requests/me`)
}

export const blockMemberFromGroupApi = async (
  conversationId: string,
  targetUserId: string
): Promise<ConversationResponse> => {
  const response = await http.post<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/block/${targetUserId}`
  )
  return response.data.data
}

export const unblockMemberFromGroupApi = async (
  conversationId: string,
  targetUserId: string
): Promise<ConversationResponse> => {
  const response = await http.delete<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/block/${targetUserId}`
  )
  return response.data.data
}

export const getBlockedMembersApi = async (
  conversationId: string,
  page = 0,
  size = 20
): Promise<PageResponse<SearchMemberResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<SearchMemberResponse>>>(
    `/messages/conversations/${conversationId}/blocked-members`,
    { params: { page, size } }
  )
  return response.data.data
}

export const getBlockCandidatesApi = async (
  conversationId: string,
  query?: string,
  page = 0,
  size = 20
): Promise<PageResponse<SearchMemberResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<SearchMemberResponse>>>(
    `/messages/conversations/${conversationId}/block-candidates`,
    { params: { query, page, size } }
  )
  return response.data.data
}

export type GroupSortOption = 'activity_newest' | 'activity_oldest' | 'name_asc' | 'name_desc'
export type GroupFilterOption = 'all' | 'owner'

export const getMyGroupConversationsApi = async (params: {
  query?: string
  sort?: GroupSortOption
  filter?: GroupFilterOption
  page?: number
  size?: number
}): Promise<PageResponse<ConversationResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<ConversationResponse>>>(
    '/messages/conversations/groups/mine',
    { params: { ...params, page: params.page ?? 0, size: params.size ?? 20 } }
  )
  return response.data.data
}

// ─────────────────────────── PIN ───────────────────────────

export const getPinsApi = async (conversationId: string): Promise<PinnedMessageInfo[]> => {
  const response = await http.get<ApiResponse<PinnedMessageInfo[]>>(`/messages/conversations/${conversationId}/pins`)
  return response.data.data
}

export const pinMessageApi = async (conversationId: string, messageId: string): Promise<PinnedMessageInfo> => {
  const response = await http.post<ApiResponse<PinnedMessageInfo>>(
    `/messages/conversations/${conversationId}/messages/${messageId}/pin`
  )
  return response.data.data
}

export const unpinMessageApi = async (conversationId: string, messageId: string): Promise<void> => {
  await http.delete(`/messages/conversations/${conversationId}/messages/${messageId}/pin`)
}

export const getQuickConversationsApi = async (size = 3): Promise<UserSummaryResponse[]> => {
  const response = await http.get<ApiResponse<UserSummaryResponse[]>>('/messages/conversations/quick', {
    params: { size }
  })
  return response.data.data
}
