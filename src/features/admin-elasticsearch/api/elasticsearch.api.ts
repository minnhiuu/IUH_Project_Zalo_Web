import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  ElasticsearchHealthResponse,
  IndexStatsResponse,
  DataComparisonResponse,
  UserIndex,
  ReindexResponse,
  ReindexStatus,
  IndexDetail,
  DeadEvent,
  ElasticsearchSummaryResponse
} from '../schemas/elasticsearch.schema'

export const elasticsearchApi = {
  getSummary: () => http.get<ApiResponse<ElasticsearchSummaryResponse>>('/users/elasticsearch/summary'),

  getHealth: () => http.get<ApiResponse<ElasticsearchHealthResponse>>('/users/elasticsearch/health'),

  getStats: () => http.get<ApiResponse<IndexStatsResponse>>('/users/elasticsearch/stats'),

  compareWithDatabase: () => http.get<ApiResponse<DataComparisonResponse>>('/users/elasticsearch/compare'),

  getDocument: (userId: string) => http.get<ApiResponse<UserIndex>>(`/users/elasticsearch/document/${userId}`),

  reindexUsers: () => http.post<ApiResponse<ReindexResponse>>('/users/elasticsearch/reindex'),

  retryDeadEvents: (data?: { fromDate?: string; toDate?: string }) =>
    http.post<ApiResponse<{ message: string; count: number }>>('/users/elasticsearch/dlq/retry', data),

  getDeadEventsPaged: (params: {
    search?: string
    eventType?: string
    retryRange?: string
    fromDate?: string
    toDate?: string
    page?: number
    size?: number
  }) => http.get<ApiResponse<PageResponse<DeadEvent>>>('/users/elasticsearch/dlq/paged', { params }),
  getReindexStatus: (taskId: string) =>
    http.get<ApiResponse<ReindexStatus>>(`/users/elasticsearch/reindex/status/${taskId}`),

  reindexUser: (userId: string) =>
    http.post<ApiResponse<{ message: string; userId: string }>>(`/users/elasticsearch/reindex/${userId}`),

  getAllIndexes: () => http.get<ApiResponse<IndexDetail[]>>('/users/elasticsearch/indexes'),

  switchAlias: (indexName: string) =>
    http.post<ApiResponse<{ message: string; indexName: string }>>(`/users/elasticsearch/indexes/${indexName}/switch`),

  deleteIndex: (indexName: string) =>
    http.delete<ApiResponse<{ message: string; indexName: string }>>(`/users/elasticsearch/indexes/${indexName}`)
}
