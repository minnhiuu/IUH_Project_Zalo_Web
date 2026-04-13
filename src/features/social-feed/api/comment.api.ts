import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  BackendCommentResponse,
  CreateCommentRequest,
  ReactionResponse,
  ToggleReactionRequest,
  UpdateCommentRequest
} from '../schemas/comment.schema'

export const commentApi = {
  getRootCommentsByPost: (postId: string, page = 0, size = 20, sortBy = 'NEWEST') =>
    http.get<ApiResponse<PageResponse<BackendCommentResponse>>>(`/comments/post/${postId}`, {
      params: { page, size, sortBy }
    }),

  getRepliesByComment: (commentId: string) =>
    http.get<ApiResponse<BackendCommentResponse[]>>(`/comments/${commentId}/replies`),

  createComment: (body: CreateCommentRequest) => http.post<ApiResponse<BackendCommentResponse>>('/comments', body),

  updateComment: (commentId: string, body: UpdateCommentRequest) =>
    http.put<ApiResponse<BackendCommentResponse>>(`/comments/${commentId}`, body),

  deleteComment: (commentId: string) => http.delete<ApiResponse<void>>(`/comments/${commentId}`),

  toggleReaction: (body: ToggleReactionRequest) => http.post<ApiResponse<ReactionResponse>>('/reactions/toggle', body),

  deleteReaction: (targetId: string, targetType: 'POST' | 'COMMENT') =>
    http.delete<ApiResponse<ReactionResponse>>('/reactions', {
      params: { targetId, targetType }
    }),

  searchReactions: (targetType: 'POST' | 'COMMENT', reactionType: ReactionResponse['type']) =>
    http.get<ApiResponse<ReactionResponse[]>>('/reactions/search', {
      params: { targetType, reactionType }
    })
}
