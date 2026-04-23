import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { QUERY_POLICIES } from '@/constants'
import { socialFeedApi, type BackendPostResponse } from '../api/post.api'
import { commentApi } from '../api/comment.api'
import {
  myPostsKeys,
  singlePostKeys,
  socialFeedCommentKeys,
  socialFeedKeys,
  socialReelKeys,
  socialStoryKeys,
  userPostsKeys
} from './keys'
import type { SocialPost } from '../components/post/post-card'
import type { SocialStory, StoryGroup } from '../components/stories/stories-strip'
import type { BackendCommentResponse, SocialFeedComment } from '../schemas/comment.schema'

const toPostType = (postType?: string | null): SocialPost['postType'] => {
  switch ((postType ?? '').toUpperCase()) {
    case 'SHARE':
      return 'SHARE'
    case 'STORY':
      return 'STORY'
    case 'REEL':
      return 'REEL'
    case 'FEED':
    default:
      return 'FEED'
  }
}

const toVisibility = (visibility?: string | null): SocialPost['visibility'] => {
  switch ((visibility ?? '').toUpperCase()) {
    case 'FRIENDS':
      return 'Friends'
    case 'PRIVATE':
      return 'Private'
    case 'ALL':
    case 'PUBLIC':
    default:
      return 'Public'
  }
}

const normalizeHashtag = (tag: string) => (tag.startsWith('#') ? tag : `#${tag}`)

const pickDisplayContent = (post: BackendPostResponse) => {
  return post.content ?? post.sharedCaption ?? null
}

const toContent = (post: BackendPostResponse): string => {
  const content = pickDisplayContent(post)

  const sections = [content?.title, content?.caption, content?.description]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  const hashtags = (content?.hashtags ?? []).filter(Boolean).map(normalizeHashtag).join(' ')
  if (hashtags) {
    sections.push(hashtags)
  }

  return sections.join('\n\n') || ''
}

const getFallbackAuthorName = () => 'Unknown user'

const mapPostToSocialPost = (post: BackendPostResponse): SocialPost => {
  const media =
    post.media
      ?.map((item) => {
        const mediaType = (item.type ?? '').toUpperCase()
        if (!item.url) {
          return null
        }

        return {
          url: item.url,
          type: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE'
        } as const
      })
      .filter((item): item is { url: string; type: 'IMAGE' | 'VIDEO' } => Boolean(item)) ?? []

  const normalizedTopReactions = (post.stats?.topReactions ?? [])
    .map((type) => (type ?? '').toUpperCase())
    .filter((type): type is NonNullable<SocialPost['topReactions']>[number] =>
      ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'].includes(type)
    )

  return {
    id: post.id,
    authorId: post.authorInfo?.id ?? null,
    authorName: post.authorInfo?.fullName?.trim() || getFallbackAuthorName(),
    authorAvatar: post.authorInfo?.avatar ?? null,
    postType: toPostType(post.postType),
    postedAt: post.uploadedAt ?? '',
    visibility: toVisibility(post.visibility),
    content: toContent(post),
    media,
    reactions: post.stats?.reactionCount ?? 0,
    topReactions: normalizedTopReactions,
    comments: post.stats?.commentCount ?? 0,
    shares: post.stats?.shareCount ?? 0,
    rootPostId: post.rootPostId ?? null,
    currentUserReaction: (post.currentUserReaction?.toUpperCase() ?? null) as SocialPost['currentUserReaction']
  }
}

type BackendSharedPostPreview = NonNullable<BackendPostResponse['sharedPostPreview']>

const mapSharedPreview = (preview: BackendSharedPostPreview): SocialPost['sharedPost'] => {
  const content = preview.content
  const sections = [content?.title, content?.caption, content?.description]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
  const hashtags = (content?.hashtags ?? []).filter(Boolean).map(normalizeHashtag).join(' ')
  if (hashtags) sections.push(hashtags)

  const media =
    preview.media
      ?.map((item) => {
        const mediaType = (item.type ?? '').toUpperCase()
        if (!item.url) return null
        return {
          url: item.url,
          type: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE'
        } as const
      })
      .filter((item): item is { url: string; type: 'IMAGE' | 'VIDEO' } => Boolean(item)) ?? []

  return {
    postId: preview.postId,
    authorId: preview.authorInfo?.id ?? null,
    authorName: preview.authorInfo?.fullName?.trim() || getFallbackAuthorName(),
    authorAvatar: preview.authorInfo?.avatar ?? null,
    content: sections.join('\n\n') || '',
    media
  }
}

const mapCommentToSocialComment = (comment: BackendCommentResponse): SocialFeedComment => {
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorInfo?.id ?? '',
    authorName: comment.authorInfo?.fullName?.trim() || getFallbackAuthorName(),
    authorAvatar: comment.authorInfo?.avatar ?? null,
    parentId: comment.parentId ?? null,
    content: comment.content,
    createdAt: comment.createdAt ?? '',
    reactions: comment.reactionCount ?? 0,
    currentUserReaction: (comment.currentUserReaction?.toUpperCase() ??
      null) as SocialFeedComment['currentUserReaction'],
    isEdited: comment.isEdited ?? comment.edited ?? false,
    replyDepth: comment.replyDepth ?? 0,
    replyCount: comment.replyCount ?? 0
  }
}

const mapPostToSocialStory = (post: BackendPostResponse): SocialStory => {
  const firstMedia =
    post.media?.find((item) => item.url && (item.type ?? '').toUpperCase() === 'IMAGE') ||
    post.media?.find((item) => item.url)

  return {
    id: post.id,
    authorId: post.authorInfo?.id ?? '',
    authorName: post.authorInfo?.fullName?.trim() || getFallbackAuthorName(),
    authorAvatar: post.authorInfo?.avatar ?? null,
    mediaUrl: firstMedia?.url ?? null,
    mediaType: (firstMedia?.type ?? '').toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    caption: toContent(post),
    expiresAt: post.expiresAt ?? null,
    music: post.music ?? null,
    stats: post.stats ?? null,
    currentUserReaction: post.currentUserReaction ?? null
  }
}

type BackendStoryGroup = {
  authorInfo?: { id?: string; fullName?: string; avatar?: string } | null
  stories?: BackendPostResponse[] | null
}

const mapBackendGroupToStoryGroup = (group: BackendStoryGroup): StoryGroup => {
  const stories = (group.stories ?? []).map(mapPostToSocialStory)
  const firstStory = stories[0]
  return {
    authorId: group.authorInfo?.id ?? firstStory?.authorId ?? '',
    authorName: group.authorInfo?.fullName?.trim() || firstStory?.authorName || getFallbackAuthorName(),
    authorAvatar: group.authorInfo?.avatar ?? firstStory?.authorAvatar ?? null,
    stories
  }
}

export const getSocialFeedPostsQueryOptions = (page = 0, size = 20) =>
  queryOptions({
    queryKey: socialFeedKeys.list(page, size),
    queryFn: async () => {
      const response = await socialFeedApi.getFeedAndSharePosts(page, size)
      const posts = response.data.data

      return posts.map((post) => {
        const mappedPost = mapPostToSocialPost(post)

        if ((post.postType ?? '').toUpperCase() !== 'SHARE') {
          return mappedPost
        }

        // Use the embedded preview the backend now returns — no extra HTTP call needed
        if (post.sharedPostPreview) {
          return {
            ...mappedPost,
            sharedPost: mapSharedPreview(post.sharedPostPreview)
          }
        }

        // Fallback: sharedPostId present but preview missing (deleted / unavailable post)
        if (post.sharedPostId) {
          return {
            ...mappedPost,
            sharedPost: {
              postId: post.sharedPostId,
              authorId: null,
              authorName: 'Original post unavailable',
              authorAvatar: null,
              content: '',
              media: []
            }
          }
        }

        return mappedPost
      })
    },
    ...QUERY_POLICIES.LIST
  })

export const getInfiniteSocialFeedPostsQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: [...socialFeedKeys.all, 'infinite', size] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getFeedAndSharePosts(pageParam, size)
      const posts = response.data.data

      return posts.map((post) => {
        const mappedPost = mapPostToSocialPost(post)

        if ((post.postType ?? '').toUpperCase() !== 'SHARE') {
          return mappedPost
        }

        if (post.sharedPostPreview) {
          return {
            ...mappedPost,
            sharedPost: mapSharedPreview(post.sharedPostPreview)
          }
        }

        if (post.sharedPostId) {
          return {
            ...mappedPost,
            sharedPost: {
              postId: post.sharedPostId,
              authorId: null,
              authorName: 'Original post unavailable',
              authorAvatar: null,
              content: '',
              media: []
            }
          }
        }

        return mappedPost
      })
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined
    },
    ...QUERY_POLICIES.LIST
  })

export const getSocialFeedCommentsQueryOptions = (postId: string, page = 0, size = 20, sortBy = 'NEWEST') =>
  queryOptions({
    queryKey: socialFeedCommentKeys.list(postId, page, size, sortBy),
    queryFn: async () => {
      const response = await commentApi.getRootCommentsByPost(postId, page, size, sortBy)
      const pageData = response.data.data
      return {
        comments: pageData.data.map((comment) => mapCommentToSocialComment(comment)),
        totalPages: pageData.totalPages,
        totalItems: pageData.totalItems,
        page: pageData.page
      }
    },
    ...QUERY_POLICIES.LIST
  })

export const getSocialFeedCommentRepliesQueryOptions = (postId: string, commentId: string) =>
  queryOptions({
    queryKey: socialFeedCommentKeys.replies(postId, commentId),
    queryFn: async () => {
      const response = await commentApi.getRepliesByComment(commentId)
      const replies = response.data.data
      return replies.map((comment) => mapCommentToSocialComment(comment))
    },
    ...QUERY_POLICIES.LIST
  })

export const getSocialStoriesQueryOptions = (page = 0, size = 20) =>
  queryOptions({
    queryKey: socialStoryKeys.list(page, size),
    queryFn: async () => {
      const response = await socialFeedApi.getStoryPosts(page, size)
      const groups = response.data.data as unknown as BackendStoryGroup[]
      return groups.map(mapBackendGroupToStoryGroup)
    },
    ...QUERY_POLICIES.LIST
  })

export const getSocialReelsQueryOptions = (page = 0, size = 20) =>
  queryOptions({
    queryKey: socialReelKeys.list(page, size),
    queryFn: async () => {
      const response = await socialFeedApi.getReelPosts(page, size)
      const posts = response.data.data
      return posts.map((post) => mapPostToSocialPost(post))
    },
    ...QUERY_POLICIES.LIST
  })

export const getInfiniteSocialReelsQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: [...socialReelKeys.all, 'infinite', size] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getReelPosts(pageParam, size)
      const posts = response.data.data
      return posts.map((post) => mapPostToSocialPost(post))
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined
    },
    ...QUERY_POLICIES.LIST
  })

export const getInfiniteMyPostsQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: [...myPostsKeys.all, 'infinite', size] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getMyPosts(pageParam, size)
      const posts = response.data.data.data

      return posts.map((post) => {
        const mappedPost = mapPostToSocialPost(post)

        if ((post.postType ?? '').toUpperCase() !== 'SHARE') {
          return mappedPost
        }

        if (post.sharedPostPreview) {
          return {
            ...mappedPost,
            sharedPost: mapSharedPreview(post.sharedPostPreview)
          }
        }

        if (post.sharedPostId) {
          return {
            ...mappedPost,
            sharedPost: {
              postId: post.sharedPostId,
              authorId: null,
              authorName: 'Original post unavailable',
              authorAvatar: null,
              content: '',
              media: []
            }
          }
        }

        return mappedPost
      })
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined
    },
    ...QUERY_POLICIES.LIST
  })

export const getPostByIdQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: singlePostKeys.byId(postId),
    queryFn: async () => {
      const response = await socialFeedApi.getPostById(postId)
      const post = response.data.data
      const mappedPost = mapPostToSocialPost(post)

      if ((post.postType ?? '').toUpperCase() === 'SHARE' && post.sharedPostPreview) {
        return {
          ...mappedPost,
          sharedPost: mapSharedPreview(post.sharedPostPreview)
        }
      }

      return mappedPost
    },
    enabled: !!postId
  })

export const getInfiniteUserPostsQueryOptions = (userId: string, size = 20) =>
  infiniteQueryOptions({
    queryKey: [...userPostsKeys.byUser(userId), 'infinite', size] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getUserPosts(userId, pageParam, size)
      const posts = response.data.data.data

      return posts.map((post) => {
        const mappedPost = mapPostToSocialPost(post)

        if ((post.postType ?? '').toUpperCase() !== 'SHARE') {
          return mappedPost
        }

        if (post.sharedPostPreview) {
          return {
            ...mappedPost,
            sharedPost: mapSharedPreview(post.sharedPostPreview)
          }
        }

        if (post.sharedPostId) {
          return {
            ...mappedPost,
            sharedPost: {
              postId: post.sharedPostId,
              authorId: null,
              authorName: 'Original post unavailable',
              authorAvatar: null,
              content: '',
              media: []
            }
          }
        }

        return mappedPost
      })
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined
    },
    enabled: !!userId,
    ...QUERY_POLICIES.LIST
  })
