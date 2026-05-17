import { useState, useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, Clock, Eye, Loader2, MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CommentInput } from '../comments/comment-input'
import { CommentItem } from '../comments/comment-item'
import { UserAvatar } from '@/components/common/user-avatar'
import type { SocialPost, SocialPostMedia } from './post-card'
import { useSocialText } from '../../i18n/use-social-text'
import { MediaSection } from './media-section'
import { PostMediaModal } from './post-media-modal'
import { ReactionPeopleModal } from './reaction-people-modal'
import { SharePostModal } from './share-post-modal'
import { useSocialFeedComments } from '../../queries/use-queries'
import {
  useCreateSocialCommentMutation,
  useDeleteSocialCommentMutation,
  useDeleteSocialCommentReactionMutation,
  useToggleSocialCommentReactionMutation,
  useUpdateSocialCommentMutation
} from '../../queries/use-mutations'
import type { SocialFeedComment, CommentMediaRequest } from '../../schemas/comment.schema'
import { REACTIONS, ReactionPicker, type ReactionType } from './reaction-picker'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { commentApi } from '../../api/comment.api'

import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'

type CommentSortBy = 'NEWEST' | 'MOST_REACTED'

const PAGE_SIZE = 10

interface PostCommentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: SocialPost
  hideLikeShare?: boolean
  /** Controlled reaction from PostCard — keeps PostCard, modal and media modal in sync */
  currentReaction?: ReactionType | null
  onReactionChange?: (type: ReactionType | null) => void
  onCommentAdded?: () => void
  onCommentDeleted?: () => void
}

export function PostCommentsModal({ open, onOpenChange, post, hideLikeShare, currentReaction, onReactionChange, onCommentAdded, onCommentDeleted }: PostCommentsModalProps) {
  const { text } = useSocialText()
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const [sortBy, setSortBy] = useState<CommentSortBy>('NEWEST')
  const [page, setPage] = useState(0)
  const [accumulatedComments, setAccumulatedComments] = useState<SocialFeedComment[]>([])
  const [hasMore, setHasMore] = useState(true)
  // Track whether we've loaded the first page
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const sortOptions = [
    { value: 'NEWEST' as const, label: text.commentsModal.sortNewest, icon: <Clock className='h-3.5 w-3.5' /> },
    {
      value: 'MOST_REACTED' as const,
      label: text.commentsModal.sortMostReacted,
      icon: <ArrowUpRight className='h-3.5 w-3.5' />
    }
  ]

  // Always enabled — the modal itself is lazy-mounted so this only runs when the user opens it
  const commentsQuery = useSocialFeedComments(post.id, page, PAGE_SIZE, sortBy, true)

  const createCommentMutation = useCreateSocialCommentMutation(post.id)
  const updateCommentMutation = useUpdateSocialCommentMutation(post.id)
  const deleteCommentMutation = useDeleteSocialCommentMutation(post.id)
  const toggleReactionMutation = useToggleSocialCommentReactionMutation(post.id)
  const deleteReactionMutation = useDeleteSocialCommentReactionMutation(post.id)

  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [initialSlide, setInitialSlide] = useState(0)
  const [mediaOverride, setMediaOverride] = useState<SocialPostMedia[]>([])
  const [replyTarget, setReplyTarget] = useState<SocialFeedComment | null>(null)

  // Use controlled reaction from PostCard when provided, otherwise fall back to local state
  const selectedReaction = currentReaction !== undefined ? currentReaction : (post.currentUserReaction as ReactionType ?? null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactionPeopleModalOpen, setReactionPeopleModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const activeReaction = selectedReaction ? REACTIONS.find((reaction) => reaction.type === selectedReaction) : null
  const hadReactionOnLoad = Boolean(post.currentUserReaction)
  const reactionsCount =
    post.reactions +
    (!hadReactionOnLoad && selectedReaction ? 1 : 0) +
    (hadReactionOnLoad && !selectedReaction ? -1 : 0)
  const displayedTopReactions =
    selectedReaction && !post.topReactions?.includes(selectedReaction)
      ? [selectedReaction, ...(post.topReactions ?? []).slice(0, 2)]
      : (post.topReactions ?? []).slice(0, 3)
  const topReactionOptions = displayedTopReactions
    .map((type) => REACTIONS.find((reaction) => reaction.type === type))
    .filter((reaction): reaction is (typeof REACTIONS)[number] => Boolean(reaction))

  const canShare = !hideLikeShare && post.authorId !== user?.id && post.sharedPost?.authorId !== user?.id

  const toggleMutation = useMutation({
    mutationFn: (type: ReactionType) => commentApi.toggleReaction({ targetId: post.id, targetType: 'POST', type })
  })

  const deleteMutation = useMutation({
    mutationFn: () => commentApi.deleteReaction(post.id, 'POST')
  })

  function handleReactionClick(type: ReactionType) {
    setShowReactionPicker(false)
    if (onReactionChange) {
      // Controlled mode: delegate entirely to PostCard
      onReactionChange(selectedReaction === type ? null : type)
    } else {
      // Standalone mode fallback
      setSelectedReaction(selectedReaction === type ? null : type)
      toggleMutation.mutate(type)
    }
  }

  const isMutating =
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending ||
    toggleReactionMutation.isPending ||
    deleteReactionMutation.isPending

  // Accumulate comments when a new page loads
  useEffect(() => {
    if (!commentsQuery.data) return
    const { comments: newComments, totalPages } = commentsQuery.data

    if (page === 0) {
      // Replace all when sort changes or first load
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccumulatedComments(newComments)
      setInitialLoadDone(true)
    } else {
      // Append for subsequent pages
      setAccumulatedComments((prev) => {
        const existingIds = new Set(prev.map((c) => c.id))
        const fresh = newComments.filter((c) => !existingIds.has(c.id))
        return [...prev, ...fresh]
      })
    }

    // Server tells us if there are more pages
    setHasMore(page + 1 < totalPages)
  }, [commentsQuery.data, page])

  // Reset accumulated state when sort changes
  const handleSortChange = useCallback(
    (newSort: CommentSortBy) => {
      if (newSort === sortBy) return
      setSortBy(newSort)
      setPage(0)
      setAccumulatedComments([])
      setHasMore(true)
      setInitialLoadDone(false)
    },
    [sortBy]
  )

  function handleMediaClick(index: number, mediaSource?: SocialPostMedia[]) {
    setInitialSlide(index)
    if (mediaSource) {
      setMediaOverride(mediaSource)
    } else {
      setMediaOverride([])
    }
    setMediaModalOpen(true)
  }

  function handleSharedAuthorClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!post.sharedPost?.authorId) return
    onOpenChange(false)
    if (user?.id && post.sharedPost.authorId === user.id) {
      navigate(PATHS.USER.PROFILE)
    } else {
      navigate(PATHS.USER.OTHER_PROFILE.replace(':userId', post.sharedPost.authorId))
    }
  }

  async function handleCreateComment(content: string, parentId?: string, media?: CommentMediaRequest[]) {
    await createCommentMutation.mutateAsync({
      content,
      media,
      ...(parentId ? { parentId } : {})
    })

    // Refresh back to first page after posting
    setPage(0)
    setAccumulatedComments([])
    setHasMore(true)
    setInitialLoadDone(false)
    setReplyTarget(null)
    
    if (onCommentAdded) {
      onCommentAdded()
    }
  }

  async function handleUpdateComment(commentId: string, content: string) {
    await updateCommentMutation.mutateAsync({
      commentId,
      payload: { content }
    })
  }

  async function handleDeleteComment(commentId: string) {
    await deleteCommentMutation.mutateAsync(commentId)
    // Remove locally so user sees the deletion immediately
    setAccumulatedComments((prev) => prev.filter((c) => c.id !== commentId))
    
    if (onCommentDeleted) {
      onCommentDeleted()
    }
  }

  async function handleToggleCommentReaction(commentId: string, type: ReactionType) {
    await toggleReactionMutation.mutateAsync({ commentId, type })
  }

  async function handleRemoveCommentReaction(commentId: string) {
    await deleteReactionMutation.mutateAsync(commentId)
  }

  const isFirstLoad = commentsQuery.isLoading && page === 0 && !initialLoadDone
  const isLoadingMore = commentsQuery.isFetching && page > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[96vw] sm:max-w-[680px] gap-0 overflow-hidden p-0 sm:rounded-2xl'>
        <DialogHeader className='border-b border-zinc-200 px-4 py-3 sm:px-5 sm:py-4 dark:border-white/10'>
          <DialogTitle className='text-[15px] sm:text-[16px] font-semibold text-zinc-900 dark:text-zinc-100'>
            {text.commentsModal.title}
          </DialogTitle>
          <DialogDescription className='text-[12.5px] sm:text-[13px] text-zinc-500 dark:text-zinc-400'>
            {text.commentsModal.subtitle(post.authorName, accumulatedComments.length)}
          </DialogDescription>
        </DialogHeader>

        <div className='grid max-h-[86vh] grid-rows-[1fr_auto]'>
          <div className='overflow-y-auto custom-scrollbar'>
            <div className='border-b border-zinc-200 px-4 py-3 sm:px-5 sm:py-4 dark:border-white/10'>
              <p className='text-[14.5px] leading-relaxed text-zinc-700 dark:text-zinc-300'>{post.content}</p>

              {post.postType === 'SHARE' && post.sharedPost ? (
                <div className='mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900/40'>
                  <div className='mb-2 flex items-center gap-2'>
                    <button
                      onClick={handleSharedAuthorClick}
                      disabled={!post.sharedPost.authorId}
                      className={`h-8 w-8 ${post.sharedPost.authorId ? 'transition-transform hover:scale-105 active:scale-95' : ''}`}
                    >
                      <UserAvatar
                        name={post.sharedPost.authorName}
                        src={post.sharedPost.authorAvatar}
                        className='w-full h-full border border-background'
                        fallbackClassName='bg-primary text-white text-xs font-semibold'
                      />
                    </button>
                    <button
                      onClick={handleSharedAuthorClick}
                      disabled={!post.sharedPost.authorId}
                      className={`text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 ${post.sharedPost.authorId ? 'hover:text-primary dark:hover:text-primary hover:underline' : ''}`}
                    >
                      {post.sharedPost.authorName}
                    </button>
                  </div>

                  {post.sharedPost.content ? (
                    <p className='wrap-break-word text-[14px] leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300'>
                      {post.sharedPost.content}
                    </p>
                  ) : null}

                  {post.sharedPost.media && post.sharedPost.media.length > 0 ? (
                    <div className='mt-2'>
                      <MediaSection
                        media={post.sharedPost.media}
                        attachmentAlt={text.post.attachmentAlt(post.sharedPost.authorName)}
                        onMediaClick={(index) => handleMediaClick(index, post.sharedPost?.media ?? [])}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {post.media && post.media.length > 0 && (
                <div className='mt-3'>
                  <MediaSection
                    media={post.media}
                    attachmentAlt={text.post.attachmentAlt(post.authorName)}
                    onMediaClick={(index) => handleMediaClick(index)}
                  />
                </div>
              )}

              <div className='flex items-center justify-between pt-3 text-[13px] font-medium text-zinc-500 dark:text-zinc-400'>
                <button
                  type='button'
                  onClick={() => setReactionPeopleModalOpen(true)}
                  className='flex items-center gap-2.5 rounded-md transition-colors hover:text-primary dark:hover:text-primary'
                >
                  {topReactionOptions.length > 0 ? (
                    <div className='flex items-center'>
                      {topReactionOptions.map((reaction, index) => (
                        <div
                          key={`${reaction.type}-${index}`}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border border-white bg-zinc-100 text-[13px] leading-none dark:border-zinc-900 dark:bg-zinc-800 ${index > 0 ? '-ml-2' : ''}`}
                          title={text.reactions.labels[reaction.type]}
                        >
                          <reaction.Icon size={16} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
                      {activeReaction ? (
                        <activeReaction.Icon size={16} />
                      ) : (
                        <ThumbsUp className='h-3.5 w-3.5 fill-primary text-primary' />
                      )}
                    </div>
                  )}
                  <span className='text-[15px] font-semibold text-zinc-700 dark:text-zinc-200'>{reactionsCount}</span>
                </button>
                <div className='flex items-center gap-3'>
                  <span className='cursor-pointer transition-colors hover:text-primary'>
                    {text.post.commentCount(post.comments)}
                  </span>
                  <span className='hover:text-primary cursor-pointer transition-colors'>
                    {text.post.shareCount(post.shares)}
                  </span>
                  {post.views !== undefined && post.views > 0 && (
                    <span className='flex items-center gap-1 text-zinc-400 dark:text-zinc-500'>
                      <Eye className='h-3.5 w-3.5' />
                      {post.views}
                    </span>
                  )}
                </div>
              </div>

              <div className='mt-2.5 flex w-full gap-1 border-t border-zinc-200 pt-2.5 dark:border-white/5'>
                {!hideLikeShare && (
                  <div
                    className='relative flex-1'
                    onMouseEnter={() => setShowReactionPicker(true)}
                    onMouseLeave={() => setShowReactionPicker(false)}
                  >
                    <ReactionPicker open={showReactionPicker} onSelect={handleReactionClick} />

                    <Button
                      variant='ghost'
                      className={`h-11 w-full gap-2 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.04] ${activeReaction ? activeReaction.textClass : 'text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary'}`}
                      onClick={() => {
                        if (selectedReaction) {
                          setShowReactionPicker(false)
                          if (onReactionChange) {
                            onReactionChange(null)
                          } else {
                            setSelectedReaction(null)
                            deleteMutation.mutate()
                          }
                          return
                        }
                        handleReactionClick('LIKE')
                      }}
                    >
                      <motion.div
                        whileTap={{ scale: 0.8 }}
                        animate={selectedReaction ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {activeReaction ? (
                          <activeReaction.Icon size={24} />
                        ) : (
                          <ThumbsUp className='h-4.5 w-4.5 transition-colors' />
                        )}
                      </motion.div>
                      <span className='text-[14px] font-semibold'>
                        {activeReaction ? text.reactions.labels[activeReaction.type] : text.reactions.labels.LIKE}
                      </span>
                    </Button>
                  </div>
                )}
                <Button
                  variant='ghost'
                  className='h-11 flex-1 gap-2 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-primary dark:hover:text-primary'
                  onClick={() => {
                    const commentInput = document.querySelector('textarea')
                    if (commentInput) {
                      commentInput.focus()
                    }
                  }}
                >
                  <MessageCircle className='h-4.5 w-4.5' />
                  <span className='text-[14px] font-semibold'>{text.post.comment}</span>
                </Button>
                {canShare && (
                  <Button
                    variant='ghost'
                    className='h-11 flex-1 gap-2 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-primary dark:hover:text-primary'
                    onClick={() => setShareModalOpen(true)}
                  >
                    <Share2 className='h-4.5 w-4.5' />
                    <span className='text-[14px] font-semibold'>{text.post.share}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Sort filter bar */}
            <div className='flex items-center gap-1.5 border-b border-zinc-200 px-4 py-2 sm:px-5 sm:py-2.5 dark:border-white/10'>
              <span className='mr-1 text-[12px] font-medium text-zinc-400 dark:text-zinc-500'>
                {text.commentsModal.sortBy}
              </span>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all',
                    sortBy === opt.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10'
                  ].join(' ')}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
              {commentsQuery.isFetching && page === 0 && initialLoadDone && (
                <span className='ml-auto flex items-center gap-1 text-[11px] text-zinc-400'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  {text.commentsModal.loadingComments}
                </span>
              )}
            </div>

            <div className='space-y-4 px-4 py-3 sm:px-5 sm:py-4'>
              {isFirstLoad ? (
                <div className='flex items-center justify-center gap-2 py-8 text-sm text-zinc-500 dark:text-zinc-400'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {text.commentsModal.loadingComments}
                </div>
              ) : commentsQuery.isError && accumulatedComments.length === 0 ? (
                <p className='text-sm text-red-500'>{text.commentsModal.loadError}</p>
              ) : accumulatedComments.length > 0 ? (
                <>
                  {accumulatedComments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                      currentUserId={user?.id}
                      isMutating={isMutating}
                      onReply={(selectedComment) => {
                        setReplyTarget(selectedComment)
                      }}
                      onUpdate={handleUpdateComment}
                      onDelete={handleDeleteComment}
                      onToggleReaction={handleToggleCommentReaction}
                      onRemoveReaction={handleRemoveCommentReaction}
                    />
                  ))}

                  {/* Load more */}
                  {hasMore && (
                    <div className='flex justify-center pt-2'>
                      <button
                        type='button'
                        disabled={commentsQuery.isFetching}
                        onClick={() => setPage((p) => p + 1)}
                        className='inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-[13px] font-semibold text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-primary/90 hover:border-primary/30 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-primary'
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className='h-3.5 w-3.5 animate-spin' />
                            Loading…
                          </>
                        ) : (
                          <>
                            <ChevronDown className='h-3.5 w-3.5' />
                            Load more comments
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className='flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 px-4 text-center dark:border-white/10'>
                  <MessageCircle className='mb-2 h-5 w-5 text-zinc-400' />
                  <p className='text-[13px] font-medium text-zinc-500 dark:text-zinc-400'>{text.commentsModal.empty}</p>
                </div>
              )}
            </div>
          </div>

          <div className='border-t border-zinc-200 px-4 py-3 sm:px-5 sm:py-4 dark:border-white/10'>
            <CommentInput
              placeholder={text.commentsModal.inputPlaceholder}
              isSubmitting={createCommentMutation.isPending}
              replyTarget={replyTarget ? { id: replyTarget.id, authorName: replyTarget.authorName } : null}
              onCancelReply={() => setReplyTarget(null)}
              onSubmit={handleCreateComment}
            />
          </div>
        </div>
      </DialogContent>

      <PostMediaModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        post={post}
        initialSlide={initialSlide}
        mediaOverride={mediaOverride.length > 0 ? mediaOverride : undefined}
      />
      {reactionPeopleModalOpen && (
        <ReactionPeopleModal
          open={reactionPeopleModalOpen}
          onOpenChange={setReactionPeopleModalOpen}
          targetId={post.id}
          targetType='POST'
          initialReactionType={topReactionOptions[0]?.type ?? 'LIKE'}
        />
      )}
      {shareModalOpen && <SharePostModal open={shareModalOpen} onOpenChange={setShareModalOpen} post={post} />}
    </Dialog>
  )
}
