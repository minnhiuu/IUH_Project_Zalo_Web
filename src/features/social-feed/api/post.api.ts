import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'

export interface AuthorInfo {
  id: string
  fullName?: string | null
  avatar?: string | null
}

export interface BackendPostResponse {
  id: string
  authorInfo?: AuthorInfo | null
  postType?: 'FEED' | 'STORY' | 'REEL' | 'SHARE' | string | null
  content?: {
    title?: string | null
    caption?: string | null
    description?: string | null
    hashtags?: string[] | null
  } | null
  sharedCaption?: {
    title?: string | null
    caption?: string | null
    description?: string | null
    hashtags?: string[] | null
  } | null
  sharedPostId?: string | null
  sharedPostPreview?: {
    postId: string
    authorInfo?: AuthorInfo | null
    content?: {
      title?: string | null
      caption?: string | null
      description?: string | null
      hashtags?: string[] | null
    } | null
    media?: Array<{ url?: string | null; type?: string | null }> | null
  } | null
  originalAuthorId?: string | null
  rootPostId?: string | null
  expiresAt?: string | null
  music?: {
    jamendoId?: string | null
    title?: string | null
    artistName?: string | null
    audioUrl?: string | null
    coverUrl?: string | null
    duration?: number | null
    albumName?: string | null
  } | null
  media?: Array<{
    url?: string | null
    type?: string | null
  }> | null
  visibility?: string | null
  stats?: {
    reactionCount?: number
    commentCount?: number
    shareCount?: number
    viewCount?: number
    topReactions?: string[]
  } | null
  currentUserReaction?: string | null
  uploadedAt?: string | null
}

export interface CreatePostRequest {
  postType: string
  visibility: string
  caption?: string
  title?: string
  description?: string
  hashtags?: string[]
  media?: Array<{ url: string; type: string }>
  viewerIds?: string[]
  groupId?: string
  sharedPostId?: string
  expiresAt?: string
  music?: {
    jamendoId: string
    title: string
    artistName: string
    audioUrl: string
    coverUrl?: string
    duration?: number
    albumName?: string
  }
}

export const socialFeedApi = {
  getFeedAndSharePosts: (page = 0, size = 20) =>
    http.get<ApiResponse<BackendPostResponse[]>>('/recommendations/feed', {
      params: { size }
    }),

  getReelPosts: (page = 0, size = 20) =>
    http.get<ApiResponse<BackendPostResponse[]>>('/recommendations/reels', {
      params: { size }
    }),

  getStoryPosts: (page = 0, size = 20) =>
    http.get<ApiResponse<PageResponse<BackendPostResponse>>>('/posts/stories', {
      params: { page, size }
    }),

  getPostById: (postId: string) => http.get<ApiResponse<BackendPostResponse>>(`/posts/${postId}`),

  createPost: (data: CreatePostRequest) => http.post<ApiResponse<BackendPostResponse>>('/posts', data),

  recordStoryView: (postId: string) => http.post<ApiResponse<void>>(`/interactions/posts/${postId}/view`)
}
