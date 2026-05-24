export const socialFeedKeys = {
  all: ['social-feed-posts'] as const,
  list: (page: number, size: number) => [...socialFeedKeys.all, page, size] as const
}

export const socialStoryKeys = {
  all: ['social-feed-stories'] as const,
  list: (page: number, size: number) => [...socialStoryKeys.all, page, size] as const
}

export const socialReelKeys = {
  all: ['social-feed-reels'] as const,
  list: (page: number, size: number) => [...socialReelKeys.all, page, size] as const
}

export const socialFeedCommentKeys = {
  all: ['social-feed-comments'] as const,
  byPost: (postId: string) => [...socialFeedCommentKeys.all, postId] as const,
  list: (postId: string, page: number, size: number, sortBy = 'NEWEST') =>
    [...socialFeedCommentKeys.byPost(postId), 'list', page, size, sortBy] as const,
  replies: (postId: string, commentId: string) =>
    [...socialFeedCommentKeys.byPost(postId), 'replies', commentId] as const
}

export const myPostsKeys = {
  all: ['my-posts'] as const,
  list: (page: number, size: number) => [...myPostsKeys.all, page, size] as const
}

export const interactionKeys = {
  all: ['interactions'] as const,
  viewers: (postId: string, page: number, size: number) =>
    [...interactionKeys.all, 'viewers', postId, { page, size }] as const
}

export const userPostsKeys = {
  all: ['user-posts'] as const,
  byUser: (userId: string) => [...userPostsKeys.all, userId] as const,
  list: (userId: string, page: number, size: number) => [...userPostsKeys.byUser(userId), page, size] as const
}

export const singlePostKeys = {
  all: ['single-post'] as const,
  byId: (postId: string) => [...singlePostKeys.all, postId] as const
}
