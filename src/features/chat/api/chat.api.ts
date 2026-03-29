import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type { ConversationResponse, MessageResponse, ChatMessageRequest } from '../schemas/chat.schema'

export const getConversations = async (page = 0, size = 20): Promise<PageResponse<ConversationResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<ConversationResponse>>>('/messages/conversations', {
    params: { page, size }
  })
  return response.data.data
}

export const getMessages = async (recipientId: string, page = 0, size = 20): Promise<PageResponse<MessageResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<MessageResponse>>>(`/messages/${recipientId}`, {
    params: { page, size }
  })
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
