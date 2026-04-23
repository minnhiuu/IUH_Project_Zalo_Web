import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentApi } from '../api/comment.api'
import { reactionApi } from '../api/reaction.api'
import { interactionApi } from '../api/interaction.api'
import { socialFeedApi, type CreatePostRequest } from '../api/post.api'
import { socialFeedCommentKeys, socialFeedKeys, socialStoryKeys, socialReelKeys } from './keys'
import type { CreateCommentRequest, UpdateCommentRequest } from '../schemas/comment.schema'
import type { ReactionType } from '../components/post/reaction-picker'

const invalidateSocialFeedCommentData = async (queryClient: ReturnType<typeof useQueryClient>, postId: string) => {
  await queryClient.invalidateQueries({ queryKey: socialFeedCommentKeys.byPost(postId) })
}

export const useCreateSocialPostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePostRequest) => socialFeedApi.createPost(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialFeedKeys.all })
    }
  })
}

export const useCreateSocialCommentMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<CreateCommentRequest, 'postId'> & { postId?: string }) =>
      commentApi.createComment({
        postId,
        ...payload
      }),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useUpdateSocialCommentMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: UpdateCommentRequest }) =>
      commentApi.updateComment(commentId, payload),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useDeleteSocialCommentMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useToggleSocialCommentReactionMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: ReactionType }) =>
      commentApi.toggleReaction({
        targetId: commentId,
        targetType: 'COMMENT',
        type
      }),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useDeleteSocialCommentReactionMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => commentApi.deleteReaction(commentId, 'COMMENT'),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

/**
 * Fire-and-forget mutation to record a VIEW interaction for a story.
 * Idempotent on the backend — safe to call multiple times for the same user+post.
 */
export const useRecordStoryViewMutation = () =>
  useMutation({
    mutationFn: (postId: string) => socialFeedApi.recordStoryView(postId)
  })

export const useDislikePostMutation = () => {
  return useMutation({
    mutationFn: (postId: string) => interactionApi.dislikePost(postId)
  })
}

/**
 * Toggle a reaction on a Story post (POST targetType). Invalidates story list queries on success.
 */
export const useToggleStoryReactionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
      reactionApi.toggleReaction({ targetId: postId, targetType: 'POST', type }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialStoryKeys.all })
    }
  })
}

/**
 * Delete a reaction from a Story post. Invalidates story list queries on success.
 */
export const useDeleteStoryReactionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => reactionApi.deleteReaction(postId, 'POST'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialStoryKeys.all })
    }
  })
}

/**
 * Toggle a reaction on a Reel post (POST targetType). Invalidates reel list queries on success.
 */
export const useToggleReelReactionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
      reactionApi.toggleReaction({ targetId: postId, targetType: 'POST', type }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialReelKeys.all })
    }
  })
}

/**
 * Delete a reaction from a Reel post. Invalidates reel list queries on success.
 */
export const useDeleteReelReactionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => reactionApi.deleteReaction(postId, 'POST'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialReelKeys.all })
    }
  })
}
