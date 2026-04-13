import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const interactionApi = {
  recordView: (postId: string) => http.post<ApiResponse<void>>(`/interactions/posts/${postId}/view`),

  dislikePost: (postId: string) => http.post<ApiResponse<void>>(`/interactions/posts/${postId}/dislike`)
}
