import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type { SearchEventRequest, UserSearchResponse } from '../schemas/search.schema'

export const searchUserApi = {
  search: (keyword: string, page = 0, size = 5) =>
    http.get<ApiResponse<PageResponse<UserSearchResponse>>>('/search/users', {
      params: { keyword, page, size }
    }),

  recordEvent: (request: SearchEventRequest) => http.post<ApiResponse<void>>('/search/events', request)
}
