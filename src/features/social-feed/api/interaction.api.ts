import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const interactionApi = {
  recordView: (postId: string) => http.post<ApiResponse<void>>(`/interactions/posts/${postId}/view`),

  dislikePost: (postId: string) => http.post<ApiResponse<void>>(`/interactions/posts/${postId}/dislike`),

  getViewers: (postId: string, page = 0, size = 20) =>
    http.get<ApiResponse<{ data: Array<{ id: string; authorInfo: { id: string; fullName: string; avatar: string }; viewedAt: string }>; totalPages: number; totalItems: number; page: number }>>(`/interactions/posts/${postId}/viewers`, {
      params: { page, size }
    })
}
