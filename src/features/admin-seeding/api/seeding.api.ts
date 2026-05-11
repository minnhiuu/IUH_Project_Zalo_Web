import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type { SeedResponsePayload } from '@/features/admin-seeding/schemas/seeding.schema'

export const seedingApi = {
  seedAuthAccounts: (count: number) =>
    http.post<ApiResponse<SeedResponsePayload>>('/auth/internal/seed/accounts', null, {
      params: { count }
    }),

  seedSocialFeedAll: () => http.post<ApiResponse<SeedResponsePayload>>('/social/internal/seeder/seed/all'),

  simulateBatchLikes: (postId: string, count: number = 50) =>
    http.post<ApiResponse<void>>('/reactions/test-batch-like', null, {
      params: { postId, count }
    })
}
