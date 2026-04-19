import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type { MessageSearchRequest, MessageSearchResponse } from '../schemas/message-search.schema'

export const searchMessagesApi = async (
  request: MessageSearchRequest,
  page = 0,
  size = 20
): Promise<PageResponse<MessageSearchResponse>> => {
  const response = await http.get<ApiResponse<PageResponse<MessageSearchResponse>>>('/search/messages', {
    params: { ...request, page, size }
  })
  return response.data.data
}
