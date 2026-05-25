import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type { ReactionResponse, ToggleReactionRequest } from '../schemas/comment.schema'

export type ReactionTargetType = 'POST' | 'COMMENT'
export type { ReactionType } from '../components/post/reaction-picker'

export const reactionApi = {
  /**
   * Toggle a reaction on a post or comment.
   * If the same reaction type is already active it will be deactivated (un-reacted).
   */
  toggleReaction: (body: ToggleReactionRequest) =>
    http.post<ApiResponse<ReactionResponse>>('/reactions/toggle', body),

  /**
   * Remove the current user's reaction from a target entirely.
   */
  deleteReaction: (targetId: string, targetType: ReactionTargetType) =>
    http.delete<ApiResponse<ReactionResponse>>('/reactions', {
      params: { targetId, targetType }
    }),

  /**
   * Fetch aggregated reaction stats (counts by type) for a given target.
   */
  getReactionStats: (targetId: string, targetType: ReactionTargetType) =>
    http.get<ApiResponse<{ targetId: string; targetType: ReactionTargetType; totalReactions: number; countsByType: Record<string, number> }>>('/reactions/stats', {
      params: { targetId, targetType }
    })
}
