import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type { RecentSearchRequest, RecentHistoryResponse } from '../schemas/recent-search.schema'
import type { SearchType } from '@/constants/enum'

export const recentSearchApi = {
  getRecentHistory: () => http.get<ApiResponse<RecentHistoryResponse>>('/search/recent/history'),

  addSearchItem: (data: RecentSearchRequest) => http.post<ApiResponse<void>>('/search/recent', data),

  removeItem: (id: string, type: SearchType) =>
    http.delete<ApiResponse<void>>(`/search/recent/${id}`, { params: { type } }),

  clearAll: () => http.delete<ApiResponse<void>>('/search/recent/clear-all')
}
