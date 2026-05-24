import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  MessageSearchRequest,
  MessageSearchResponse,
  MessageSearchSection,
  ConversationSearchResponse
} from '../schemas/message-search.schema'

export const searchMessagesApi = async (
  request: MessageSearchRequest,
  section: MessageSearchSection = 'all',
  page = 0,
  size = 20
): Promise<PageResponse<MessageSearchResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<MessageSearchResponse>>>('/search/messages', {
    params: { ...request, section, page, size }
  })
  return response.data.data
}

export const getMessageSearchSenders = async (keyword: string): Promise<ConversationSearchResponse[]> => {
  const response = await http.get<ApiResponse<ConversationSearchResponse[]>>('/search/messages/senders', {
    params: { keyword }
  })
  return response.data.data
}

