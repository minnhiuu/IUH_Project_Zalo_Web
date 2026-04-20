import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  MessageSearchOverviewResponse,
  MessageSearchRequest,
  MessageSearchResponse,
  MessageSearchSection
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

export const searchMessagesOverviewApi = async (
  request: MessageSearchRequest,
  sectionSize = 5
): Promise<MessageSearchOverviewResponse> => {
  const response = await http.get<ApiResponse<MessageSearchOverviewResponse>>('/search/messages/overview', {
    params: { ...request, sectionSize }
  })
  return response.data.data
}
