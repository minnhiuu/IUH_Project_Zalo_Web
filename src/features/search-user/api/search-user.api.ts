import http from '@/lib/axios-client'
import type { UserSummaryResponse } from '@/shared/user/user-summary'
import type { ApiResponse, PageResponse } from '@/shared/api'

export const searchUserApi = {
  search: (keyword: string, page = 0, size = 5) =>
    http.get<ApiResponse<PageResponse<UserSummaryResponse>>>('/users/search', {
      params: { keyword, page, size }
    })
}
