import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  ElasticsearchHealthResponse,
  IndexStatsResponse,
  ElasticsearchSummaryResponse,
  ReindexResponse,
  ReindexStatus,
  IndexDetail,
  FailedEvent,
  IndexOperationResponse
} from '../schemas/elasticsearch.schema'
import { SearchIndexType } from '@/constants/enum'

export const elasticsearchApi = {
  // Global Health
  getHealth: () => http.get<ApiResponse<ElasticsearchHealthResponse>>('/search/elasticsearch/health'),

  // Index specific operations
  getSummary: (type: SearchIndexType) => 
    http.get<ApiResponse<ElasticsearchSummaryResponse>>(`/search/elasticsearch/index/${type}/summary`),

  getStats: (type: SearchIndexType) => 
    http.get<ApiResponse<IndexStatsResponse>>(`/search/elasticsearch/index/${type}/stats`),

  getPhysicalIndexes: (type: SearchIndexType) => 
    http.get<ApiResponse<IndexDetail[]>>(`/search/elasticsearch/index/${type}/physical-indexes`),

  getFailedEventsByType: (type: SearchIndexType, page: number = 0, size: number = 10) =>
    http.get<ApiResponse<PageResponse<FailedEvent>>>(`/search/elasticsearch/index/${type}/failed-events`, {
      params: { page, size }
    }),

  // Reindexing
  reindex: (type: SearchIndexType) => 
    http.post<ApiResponse<ReindexResponse>>(`/search/elasticsearch/reindex/${type}`),

  getReindexStatus: (type: SearchIndexType, taskId: string) =>
    http.get<ApiResponse<ReindexStatus>>(`/search/elasticsearch/reindex/${type}/status/${taskId}`),

  reindexUser: (userId: string) =>
    http.post<ApiResponse<IndexOperationResponse>>(`/search/elasticsearch/reindex/users/${userId}`),

  // Document Inspection
  getDocument: (type: SearchIndexType, id: string) => 
    http.get<ApiResponse<unknown>>(`/search/elasticsearch/index/${type}/document/${id}`),

  // Alias Management
  switchAlias: (type: SearchIndexType, indexName: string) =>
    http.post<ApiResponse<IndexOperationResponse>>(`/search/elasticsearch/index/${type}/switch-alias/${indexName}`),

  // Index management
  deletePhysicalIndex: (indexName: string) =>
    http.delete<ApiResponse<IndexOperationResponse>>(`/search/elasticsearch/indexes/${indexName}`),

  // Failed events management
  getFailedEventsPaged: (params: {
    resolved?: boolean
    keyword?: string
    hours?: number
    type?: SearchIndexType
    page?: number
    size?: number
  }) => http.get<ApiResponse<PageResponse<FailedEvent>>>('/search/elasticsearch/failed-events/paged', { params }),

  getFailedEvent: (id: string) => http.get<ApiResponse<FailedEvent>>(`/search/elasticsearch/failed-events/${id}`),

  updateFailedEventResolved: (id: string, resolved: boolean) =>
    http.patch<ApiResponse<{ message: string }>>(`/search/elasticsearch/failed-events/${id}/resolved`, null, {
      params: { resolved }
    }),

  retryFailedEvent: (id: string) =>
    http.post<ApiResponse<{ message: string }>>(`/search/elasticsearch/failed-events/${id}/retry`),

  retryFailedEventsBulk: (ids: string[]) =>
    http.post<ApiResponse<{ message: string }>>('/search/elasticsearch/failed-events/retry-bulk', ids),

  retryAllFailedEvents: (type?: SearchIndexType) =>
    http.post<ApiResponse<{ message: string }>>('/search/elasticsearch/failed-events/retry-all', null, {
      params: { type }
    }),

  retryFailedEventsByDuration: (hours: number) =>
    http.post<ApiResponse<{ message: string }>>('/search/elasticsearch/failed-events/retry-duration', null, {
      params: { hours }
    })
}
