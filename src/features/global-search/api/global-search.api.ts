import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  MessageSearchOverviewResponse,
  ConversationSearchResponse
} from '@/features/search/messages/schemas/message-search.schema'

export interface GlobalSearchRequest {
  keyword: string
  conversationId?: string
  senderId?: string
  from?: string
  to?: string
}

export const globalSearchApi = {
  getOverview: async (request: GlobalSearchRequest, sectionSize = 5): Promise<MessageSearchOverviewResponse> => {
    const response = await http.get<ApiResponse<MessageSearchOverviewResponse>>('/search/overview', {
      params: { ...request, sectionSize }
    })
    return response.data.data
  },

  searchContacts: async (keyword: string, page = 0, size = 20): Promise<PageResponse<ConversationSearchResponse[]>> => {
    const response = await http.get<ApiResponse<PageResponse<ConversationSearchResponse[]>>>('/search/contacts', {
      params: { keyword, page, size }
    })
    return response.data.data
  }
}
