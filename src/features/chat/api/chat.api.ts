import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const chatApi = {
  getConversations: (page = 0, size = 20) =>
    http.get<ApiResponse<any>>('/messages/conversations', { params: { page, size } }),

  getMessages: (recipientId: string, page = 0, size = 20) =>
    http.get<ApiResponse<any>>(`/messages/${recipientId}`, { params: { page, size } })
}
