import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  ConversationResponse,
  MessageResponse,
  ChatMessageRequest,
  GroupConversationCreateRequest,
  SearchMemberResponse
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
