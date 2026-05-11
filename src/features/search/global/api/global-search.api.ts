import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  MessageSearchResponse,
  ConversationSearchResponse
} from '@/features/search/messages/schemas/message-search.schema'

export interface GlobalSearchRequest {
  keyword: string
  conversationId?: string
  senderId?: string
  from?: number
  to?: number
  fileType?: string
}

export const globalSearchApi = {
  searchContacts: async (
    keyword: string,
    page = 0,
    size = 20,
    isGroup?: boolean
  ): Promise<PageResponse<ConversationSearchResponse>> => {
    const response = await http.get<ApiResponse<PageResponse<ConversationSearchResponse>>>('/search/contacts', {
      params: { keyword, page, size, isGroup }
    })
    return response.data.data
  },

  searchSenders: async (keyword: string): Promise<ConversationSearchResponse[]> => {
    const response = await http.get<ApiResponse<ConversationSearchResponse[]>>('/search/messages/senders', {
      params: { keyword }
    })
    return response.data.data
  },


  searchMessages: async (
    request: GlobalSearchRequest,
    page = 0,
    size = 20
  ): Promise<PageResponse<MessageSearchResponse>> => {
    const response = await http.get<ApiResponse<PageResponse<MessageSearchResponse>>>('/search/messages', {
      params: { ...request, page, size, section: 'messages' }
    })
    return response.data.data
  },

  searchFiles: async (
    request: GlobalSearchRequest,
    page = 0,
    size = 20
  ): Promise<PageResponse<MessageSearchResponse>> => {
    const response = await http.get<ApiResponse<PageResponse<MessageSearchResponse>>>('/search/messages', {
      params: { ...request, page, size, section: 'files' }
    })
    return response.data.data
  }

}
