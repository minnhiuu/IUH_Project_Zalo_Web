import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  ConversationResponse,
  MessageResponse,
  ChatMessageRequest,
  GroupConversationCreateRequest
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
  data: { request: GroupConversationCreateRequest; file?: File | null }
): Promise<ConversationResponse> => {
  const formData = new FormData()
  
  // Important: Send the JSON object as a Blob with application/json type
  // so that Spring's @RequestPart can deserialize it correctly.
  formData.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }))
  
  if (data.file) {
    formData.append('file', data.file)
  }

  const response = await http.post<ApiResponse<ConversationResponse>>('/messages/conversations/groups', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
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
