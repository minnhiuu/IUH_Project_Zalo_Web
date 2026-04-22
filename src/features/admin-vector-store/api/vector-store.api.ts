import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export interface CollectionStats {
  status: 'green' | 'yellow' | 'grey' | 'ERROR' | string
  vectors_count: number
  indexed_vectors_count: number
  points_count: number
  segments_count: number
  vector_size: number
  distance: string
  error?: string
}

export interface VectorStoreStats {
  [collectionName: string]: CollectionStats
}

export const vectorStoreApi = {
  syncAllUsers: () => http.post<ApiResponse<{ updated: boolean; total_synced: number }>>('/admin/recommendations/users/sync-all'),
  getStats: () => http.get<ApiResponse<VectorStoreStats>>('/admin/vector-store/stats'),
}
