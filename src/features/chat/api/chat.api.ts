import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  ConversationResponse,
  MessageResponse,
  ChatMessageRequest,
  GroupConversationCreateRequest,
  SearchMemberResponse,
  GroupMemberListItemResponse,
  GroupSettings,
  JoinGroupPreviewResponse,
  JoinRequestResponse
} from '../schemas/chat.schema'

export const getConversations = async (page = 0, size = 20): Promise<PageResponse<ConversationResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<ConversationResponse>>>('/messages/conversations', {
    params: { page, size }
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

export const markAsRead = async (conversationId: string): Promise<void> => {
  await http.put(`/messages/conversations/${conversationId}/read`)
}

export const sendMessageApi = async (data: ChatMessageRequest): Promise<void> => {
  const { conversationId, ...requestBody } = data
  await http.post(`/messages/conversations/${conversationId}/messages`, requestBody)
}

export const revokeMessageApi = async (messageId: string): Promise<void> => {
  await http.patch(`/messages/messages/${messageId}/revoke`)
}

export const deleteMessageForMeApi = async (messageId: string): Promise<void> => {
  await http.delete(`/messages/messages/${messageId}/me`)
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

export const leaveGroupApi = async (conversationId: string, silent = false, transferTo?: string): Promise<void> => {
  await http.delete(`/messages/conversations/${conversationId}/leave`, {
    params: { silent, ...(transferTo ? { transferTo } : {}) }
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

export const removeMemberFromGroupApi = async (
  conversationId: string,
  targetUserId: string
): Promise<ConversationResponse> => {
  const response = await http.delete<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/members/${targetUserId}`
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
    `/messages/conversations/${conversationId}/members/${targetUserId}/transfer-owner`
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

export const joinByLinkApi = async (token: string): Promise<ConversationResponse> => {
  const response = await http.post<ApiResponse<ConversationResponse>>(`/messages/conversations/join/${token}`)
  return response.data.data
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

export const blockMembersApi = async (conversationId: string, memberIds: string[]): Promise<ConversationResponse> => {
  const response = await http.post<ApiResponse<ConversationResponse>>(
    `/messages/conversations/${conversationId}/members/block`,
    { memberIds }
  )
  return response.data.data
}
