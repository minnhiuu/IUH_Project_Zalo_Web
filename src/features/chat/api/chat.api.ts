import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type { ConversationResponse, MessageResponse, ChatMessageRequest } from '../schemas/chat.schema'

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
  await http.post('/messages/send', data)
}

export const revokeMessageApi = async (messageId: string): Promise<void> => {
  await http.patch(`/messages/${messageId}/revoke`)
}

export const deleteMessageForMeApi = async (messageId: string): Promise<void> => {
  await http.delete(`/messages/me/${messageId}`)
}
