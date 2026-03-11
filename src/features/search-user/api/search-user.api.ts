import http from '@/lib/axios-client'
import type { UserSummaryResponse } from '@/shared/user/user-summary'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type { RecentSearchRequest, RecentSearchResponse } from '../schemas/search.schema'
import type { SearchType } from '@/constants/enum'

export const searchUserApi = {
  search: (keyword: string, page = 0, size = 5) =>
    http.get<ApiResponse<PageResponse<UserSummaryResponse>>>('/search/users', {
      params: { keyword, page, size }
    }),

  getRecentItems: () => http.get<ApiResponse<RecentSearchResponse[]>>('/search/recent/items'),

  getRecentQueries: () => http.get<ApiResponse<RecentSearchResponse[]>>('/search/recent/queries'),

  addSearchItem: (data: RecentSearchRequest) => http.post<ApiResponse<void>>('/search/recent', data),

  removeItem: (id: string, type: SearchType) =>
    http.delete<ApiResponse<void>>(`/search/recent/${id}`, { params: { type } }),

  clearAll: () => http.delete<ApiResponse<void>>('/search/recent/clear-all')
}
