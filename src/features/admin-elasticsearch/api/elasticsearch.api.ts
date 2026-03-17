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
  FailedEvent,
  ElasticsearchSummaryResponse
} from '../schemas/elasticsearch.schema'

export const elasticsearchApi = {
  getSummary: () => http.get<ApiResponse<ElasticsearchSummaryResponse>>('/search/elasticsearch/summary'),

  getHealth: () => http.get<ApiResponse<ElasticsearchHealthResponse>>('/search/elasticsearch/health'),

  getStats: () => http.get<ApiResponse<IndexStatsResponse>>('/search/elasticsearch/stats'),

  compareWithDatabase: () => http.get<ApiResponse<DataComparisonResponse>>('/search/elasticsearch/compare'),

  getDocument: (userId: string) => http.get<ApiResponse<UserIndex>>(`/search/elasticsearch/document/${userId}`),

  reindexUsers: () => http.post<ApiResponse<ReindexResponse>>('/search/elasticsearch/reindex'),

  updateFailedEventResolved: (id: string, resolved: boolean) =>
    http.patch<ApiResponse<{ message: string }>>(`/search/elasticsearch/failed-events/${id}/resolved`, null, {
      params: { resolved }
    }),

  getFailedEventsPaged: (params: {
    resolved?: boolean
    keyword?: string
    hours?: number
    page?: number
    size?: number
  }) => http.get<ApiResponse<PageResponse<FailedEvent>>>('/search/elasticsearch/failed-events/paged', { params }),

  getReindexStatus: (taskId: string) =>
    http.get<ApiResponse<ReindexStatus>>(`/search/elasticsearch/reindex/status/${taskId}`),

  reindexUser: (userId: string) =>
    http.post<ApiResponse<{ message: string; userId: string }>>(`/search/elasticsearch/reindex/${userId}`),

  getAllIndexes: () => http.get<ApiResponse<IndexDetail[]>>('/search/elasticsearch/indexes'),

  switchAlias: (indexName: string) =>
    http.post<ApiResponse<{ message: string; indexName: string }>>(`/search/elasticsearch/indexes/${indexName}/switch`),

  deleteIndex: (indexName: string) =>
    http.delete<ApiResponse<{ message: string; indexName: string }>>(`/search/elasticsearch/indexes/${indexName}`),

  getFailedEvent: (id: string) => http.get<ApiResponse<FailedEvent>>(`/search/elasticsearch/failed-events/${id}`),

  retryFailedEvent: (id: string) =>
    http.post<ApiResponse<{ message: string }>>(`/search/elasticsearch/failed-events/${id}/retry`),

  retryFailedEventsBulk: (ids: string[]) =>
    http.post<ApiResponse<{ message: string }>>('/search/elasticsearch/failed-events/retry-bulk', ids),

  retryAllFailedEvents: () =>
    http.post<ApiResponse<{ message: string }>>('/search/elasticsearch/failed-events/retry-all'),

  retryFailedEventsByDuration: (hours: number) =>
    http.post<ApiResponse<{ message: string }>>('/search/elasticsearch/failed-events/retry-duration', null, {
      params: { hours }
    })
}
