import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  getSocialFeedCommentRepliesQueryOptions,
  getSocialFeedCommentsQueryOptions,
  getSocialFeedPostsQueryOptions,
  getSocialReelsQueryOptions,
  getSocialStoriesQueryOptions,
  getInfiniteSocialFeedPostsQueryOptions,
  getInfiniteSocialReelsQueryOptions,
  getInfiniteMyPostsQueryOptions,
  getInfiniteUserPostsQueryOptions,
  getPostByIdQueryOptions,
  getStoryViewersQueryOptions
} from './options'

export const useSocialFeedPosts = (page = 0, size = 20) => {
  return useQuery(getSocialFeedPostsQueryOptions(page, size))
}

export const useInfiniteSocialFeedPosts = (size = 20) => {
  return useInfiniteQuery(getInfiniteSocialFeedPostsQueryOptions(size))
}

export const useSocialFeedComments = (postId: string, page = 0, size = 20, sortBy = 'NEWEST', enabled = true) => {
  return useQuery({
    ...getSocialFeedCommentsQueryOptions(postId, page, size, sortBy),
    enabled
  })
}

export const useSocialCommentReplies = (postId: string, commentId: string, enabled = true) => {
  return useQuery({
    ...getSocialFeedCommentRepliesQueryOptions(postId, commentId),
    enabled
  })
}

export const useSocialStories = (page = 0, size = 20) => {
  return useQuery(getSocialStoriesQueryOptions(page, size))
}

export const useSocialReels = (page = 0, size = 20) => {
  return useQuery(getSocialReelsQueryOptions(page, size))
}

export const useInfiniteSocialReels = (size = 20) => {
  return useInfiniteQuery(getInfiniteSocialReelsQueryOptions(size))
}

export const useInfiniteMyPosts = (size = 20) => {
  return useInfiniteQuery(getInfiniteMyPostsQueryOptions(size))
}

export const useInfiniteUserPosts = (userId: string, size = 20) => {
  return useInfiniteQuery(getInfiniteUserPostsQueryOptions(userId, size))
}

export const usePostById = (postId: string) => {
  return useQuery(getPostByIdQueryOptions(postId))
}

export const useStoryViewers = (postId: string, page = 0, size = 100, enabled = true) => {
  return useQuery({
    ...getStoryViewersQueryOptions(postId, page, size),
    enabled: enabled
  })
}
