import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type { UserSearchResponse } from '../schemas/search.schema'

export const searchUserApi = {
  search: (keyword: string, page = 0, size = 5) =>
    http.get<ApiResponse<PageResponse<UserSearchResponse>>>('/search/users', {
      params: { keyword, page, size }
    })
}
