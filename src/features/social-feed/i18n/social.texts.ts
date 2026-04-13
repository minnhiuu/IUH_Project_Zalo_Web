import type { TFunction } from 'i18next'
import { SOCIAL_KEYS } from './social.keys'

export const createSocialTexts = (t: TFunction<'social'>) => ({
  reactions: {
    labels: {
      LIKE: t(SOCIAL_KEYS.reactions.like),
      LOVE: t(SOCIAL_KEYS.reactions.love),
      HAHA: t(SOCIAL_KEYS.reactions.haha),
      WOW: t(SOCIAL_KEYS.reactions.wow),
      SAD: t(SOCIAL_KEYS.reactions.sad),
      ANGRY: t(SOCIAL_KEYS.reactions.angry)
    },
    react: t(SOCIAL_KEYS.reactions.react)
  },

  composer: {
    me: t(SOCIAL_KEYS.composer.me),
    visibilityPublic: t(SOCIAL_KEYS.composer.visibilityPublic),
    placeholder: t(SOCIAL_KEYS.composer.placeholder),
    image: t(SOCIAL_KEYS.composer.image),
    video: t(SOCIAL_KEYS.composer.video),
    feeling: t(SOCIAL_KEYS.composer.feeling),
    post: t(SOCIAL_KEYS.composer.post)
  },

  launcher: {
    prompt: t(SOCIAL_KEYS.launcher.prompt),
    dialogTitle: t(SOCIAL_KEYS.launcher.dialogTitle),
    dialogDescription: t(SOCIAL_KEYS.launcher.dialogDescription),
    createPost: t(SOCIAL_KEYS.launcher.createPost),
    draft: t(SOCIAL_KEYS.launcher.draft)
  },

  search: {
    placeholder: t(SOCIAL_KEYS.search.placeholder),
    noResults: t(SOCIAL_KEYS.search.noResults)
  },

  stories: {
    title: t(SOCIAL_KEYS.stories.title),
    create: t(SOCIAL_KEYS.stories.create),
    empty: t(SOCIAL_KEYS.stories.empty),
    itemAlt: (author: string) => t(SOCIAL_KEYS.stories.itemAlt, { author })
  },

  storyComposer: {
    title: t(SOCIAL_KEYS.storyComposer.title),
    mediaLabel: t(SOCIAL_KEYS.storyComposer.mediaLabel),
    captionLabel: t(SOCIAL_KEYS.storyComposer.captionLabel),
    captionPlaceholder: t(SOCIAL_KEYS.storyComposer.captionPlaceholder),
    pickMediaTitle: t(SOCIAL_KEYS.storyComposer.pickMediaTitle),
    pickMediaSubtitle: t(SOCIAL_KEYS.storyComposer.pickMediaSubtitle),
    addImage: t(SOCIAL_KEYS.storyComposer.addImage),
    addVideo: t(SOCIAL_KEYS.storyComposer.addVideo),
    addMusic: t(SOCIAL_KEYS.storyComposer.addMusic),
    addMusicHint: t(SOCIAL_KEYS.storyComposer.addMusicHint),
    nowPlaying: t(SOCIAL_KEYS.storyComposer.nowPlaying),
    musicSearchPlaceholder: t(SOCIAL_KEYS.storyComposer.musicSearchPlaceholder),
    musicNoResults: t(SOCIAL_KEYS.storyComposer.musicNoResults),
    musicLoadError: t(SOCIAL_KEYS.storyComposer.musicLoadError),
    share: t(SOCIAL_KEYS.storyComposer.share),
    expiresHint: t(SOCIAL_KEYS.storyComposer.expiresHint),
    successToast: t(SOCIAL_KEYS.storyComposer.successToast),
    errorToast: t(SOCIAL_KEYS.storyComposer.errorToast)
  },

  reels: {
    title: t(SOCIAL_KEYS.reels.title),
    empty: t(SOCIAL_KEYS.reels.empty),
    loadFailed: t(SOCIAL_KEYS.reels.loadFailed),
    copyLink: t(SOCIAL_KEYS.reels.copyLink),
    retry: t(SOCIAL_KEYS.reels.retry),
    noVideo: t(SOCIAL_KEYS.reels.noVideo),
    videoFailed: t(SOCIAL_KEYS.reels.videoFailed),
    muteAriaLabel: t(SOCIAL_KEYS.reels.muteAriaLabel),
    unmuteAriaLabel: t(SOCIAL_KEYS.reels.unmuteAriaLabel),
    playAriaLabel: t(SOCIAL_KEYS.reels.playAriaLabel),
    pauseAriaLabel: t(SOCIAL_KEYS.reels.pauseAriaLabel),
    seekAriaLabel: t(SOCIAL_KEYS.reels.seekAriaLabel)
  },

  post: {
    attachmentAlt: (author: string) => t(SOCIAL_KEYS.post.attachmentAlt, { author }),
    commentCount: (count: number) => t(SOCIAL_KEYS.post.commentCount, { count }),
    shareCount: (count: number) => t(SOCIAL_KEYS.post.shareCount, { count }),
    comment: t(SOCIAL_KEYS.post.comment),
    share: t(SOCIAL_KEYS.post.share),
    visibility: {
      Public: t(SOCIAL_KEYS.post.visibilityPublic),
      Friends: t(SOCIAL_KEYS.post.visibilityFriends),
      Private: t(SOCIAL_KEYS.post.visibilityPrivate)
    },
    sharedAPost: t(SOCIAL_KEYS.post.sharedAPost),
    justNow: t(SOCIAL_KEYS.post.justNow),
    readMore: t(SOCIAL_KEYS.post.readMore),
    showLess: t(SOCIAL_KEYS.post.showLess)
  },

  commentsModal: {
    title: t(SOCIAL_KEYS.commentsModal.title),
    subtitle: (author: string, count: number) => t(SOCIAL_KEYS.commentsModal.subtitle, { author, count }),
    mediaAlt: (author: string) => t(SOCIAL_KEYS.commentsModal.mediaAlt, { author }),
    empty: t(SOCIAL_KEYS.commentsModal.empty),
    inputPlaceholder: t(SOCIAL_KEYS.commentsModal.inputPlaceholder),
    closeAriaLabel: t(SOCIAL_KEYS.commentsModal.closeAriaLabel),
    commentCount: (count: number) => t(SOCIAL_KEYS.commentsModal.commentCount, { count }),
    loadingComments: t(SOCIAL_KEYS.commentsModal.loadingComments),
    loadError: t(SOCIAL_KEYS.commentsModal.loadError),
    beFirstToComment: t(SOCIAL_KEYS.commentsModal.beFirstToComment),
    sortBy: t(SOCIAL_KEYS.commentsModal.sortBy),
    sortNewest: t(SOCIAL_KEYS.commentsModal.sortNewest),
    sortMostReacted: t(SOCIAL_KEYS.commentsModal.sortMostReacted),
    sample: {
      author1: t(SOCIAL_KEYS.commentsModal.sample.author1),
      author2: t(SOCIAL_KEYS.commentsModal.sample.author2),
      createdAt1: t(SOCIAL_KEYS.commentsModal.sample.createdAt1),
      createdAt2: t(SOCIAL_KEYS.commentsModal.sample.createdAt2),
      content1: t(SOCIAL_KEYS.commentsModal.sample.content1),
      content2: t(SOCIAL_KEYS.commentsModal.sample.content2)
    }
  },

  reactionsModal: {
    title: t(SOCIAL_KEYS.reactionsModal.title),
    subtitle: (count: number) => t(SOCIAL_KEYS.reactionsModal.subtitle, { count }),
    loading: t(SOCIAL_KEYS.reactionsModal.loading),
    loadError: t(SOCIAL_KEYS.reactionsModal.loadError),
    emptyByType: t(SOCIAL_KEYS.reactionsModal.emptyByType),
    unknownUser: t(SOCIAL_KEYS.reactionsModal.unknownUser)
  },

  commentItem: {
    reply: t(SOCIAL_KEYS.commentItem.reply),
    edited: t(SOCIAL_KEYS.commentItem.edited),
    cancel: t(SOCIAL_KEYS.commentItem.cancel),
    save: t(SOCIAL_KEYS.commentItem.save),
    edit: t(SOCIAL_KEYS.commentItem.edit),
    delete: t(SOCIAL_KEYS.commentItem.delete),
    hideReplies: t(SOCIAL_KEYS.commentItem.hideReplies),
    viewReplies: (count: number) => t(SOCIAL_KEYS.commentItem.viewReplies, { count }),
    loadingReplies: t(SOCIAL_KEYS.commentItem.loadingReplies),
    loadRepliesError: t(SOCIAL_KEYS.commentItem.loadRepliesError),
    noReplies: t(SOCIAL_KEYS.commentItem.noReplies)
  },

  commentInput: {
    replyingTo: (author: string) => t(SOCIAL_KEYS.commentInput.replyingTo, { author }),
    cancel: t(SOCIAL_KEYS.commentInput.cancel),
    uploadPhoto: t(SOCIAL_KEYS.commentInput.uploadPhoto),
    uploadVideo: t(SOCIAL_KEYS.commentInput.uploadVideo),
    invalidMedia: t(SOCIAL_KEYS.commentInput.invalidMedia),
    uploadFailed: t(SOCIAL_KEYS.commentInput.uploadFailed)
  },

  shareModal: {
    title: t(SOCIAL_KEYS.shareModal.title),
    captionPlaceholder: t(SOCIAL_KEYS.shareModal.captionPlaceholder),
    shareNow: t(SOCIAL_KEYS.shareModal.shareNow),
    shareSuccess: t(SOCIAL_KEYS.shareModal.shareSuccess),
    shareFailed: t(SOCIAL_KEYS.shareModal.shareFailed),
    unknownUser: t(SOCIAL_KEYS.shareModal.unknownUser)
  },

  sidebar: {
    account: t(SOCIAL_KEYS.sidebar.account),
    friends: t(SOCIAL_KEYS.sidebar.friends),
    groups: t(SOCIAL_KEYS.sidebar.groups),
    reels: t(SOCIAL_KEYS.sidebar.reels),
    saved: t(SOCIAL_KEYS.sidebar.saved),
    memories: t(SOCIAL_KEYS.sidebar.memories)
  },

  suggested: {
    title: t(SOCIAL_KEYS.suggested.title),
    seeAll: t(SOCIAL_KEYS.suggested.seeAll),
    mutualCount: (count: number) => t(SOCIAL_KEYS.suggested.mutualCount, { count }),
    addFriend: t(SOCIAL_KEYS.suggested.addFriend),
    footerPrivacy: t(SOCIAL_KEYS.suggested.footerPrivacy),
    footerTerms: t(SOCIAL_KEYS.suggested.footerTerms),
    footerAds: t(SOCIAL_KEYS.suggested.footerAds),
    footerCookie: t(SOCIAL_KEYS.suggested.footerCookie),
    footerBrand: (year: number) => t(SOCIAL_KEYS.suggested.footerBrand, { year })
  },

  mockPosts: {
    postedAt1: t(SOCIAL_KEYS.mockPosts.postedAt1),
    postedAt2: t(SOCIAL_KEYS.mockPosts.postedAt2),
    postedAt3: t(SOCIAL_KEYS.mockPosts.postedAt3),
    content1: t(SOCIAL_KEYS.mockPosts.content1),
    content2: t(SOCIAL_KEYS.mockPosts.content2),
    content3: t(SOCIAL_KEYS.mockPosts.content3)
  }
})
