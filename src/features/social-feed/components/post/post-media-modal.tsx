import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { MessageCircle, Share2, MoreHorizontal, Globe, Users, ThumbsUp, Eye } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { VideoPlayer } from '@/components/common/video-player'
import { CommentInput } from '../comments/comment-input'
import { CommentItem } from '../comments/comment-item'
import { REACTIONS, ReactionPicker, type ReactionType } from './reaction-picker'
import type { SocialPost } from './post-card'
import { useSocialText } from '../../i18n/use-social-text'
import { Button } from '@/components/ui/button'
import type { SocialFeedComment } from '../../schemas/comment.schema'
import { useSocialFeedComments } from '../../queries/use-queries'
import {
  useCreateSocialCommentMutation,
  useDeleteSocialCommentMutation,
  useDeleteSocialCommentReactionMutation,
  useToggleSocialCommentReactionMutation,
  useUpdateSocialCommentMutation
} from '../../queries/use-mutations'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { formatRelativeTime } from '@/utils/date'
import type { SocialPostMedia } from './post-card'
import { ReactionPeopleModal } from './reaction-people-modal'
import { SharePostModal } from './share-post-modal'
import { commentApi } from '../../api/comment.api'


interface PostMediaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: SocialPost
  initialSlide?: number
  mediaOverride?: SocialPostMedia[]
}

export function PostMediaModal({ open, onOpenChange, post, initialSlide = 0, mediaOverride }: PostMediaModalProps) {
  const { text, language } = useSocialText()
  const { user } = useAuthContext()

  
  const commentsQuery = useSocialFeedComments(post.id, 0, 20)
  const createCommentMutation = useCreateSocialCommentMutation(post.id)
  const updateCommentMutation = useUpdateSocialCommentMutation(post.id)
  const deleteCommentMutation = useDeleteSocialCommentMutation(post.id)
  const toggleReactionMutation = useToggleSocialCommentReactionMutation(post.id)
  const deleteReactionMutation = useDeleteSocialCommentReactionMutation(post.id)

  const comments = commentsQuery.data?.comments ?? []
  const [replyTarget, setReplyTarget] = useState<SocialFeedComment | null>(null)

  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    (post.currentUserReaction as ReactionType) ?? null
  )
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactionPeopleModalOpen, setReactionPeopleModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const activeReaction = selectedReaction ? REACTIONS.find((reaction) => reaction.type === selectedReaction) : null
  const hadReactionOnLoad = Boolean(post.currentUserReaction)
  const reactionsCount =
    post.reactions +
    (!hadReactionOnLoad && selectedReaction ? 1 : 0) +
    (hadReactionOnLoad && !selectedReaction ? -1 : 0)

  const toggleMutation = useMutation({
    mutationFn: (type: ReactionType) =>
      commentApi.toggleReaction({ targetId: post.id, targetType: 'POST', type })
  })

  const deleteMutation = useMutation({
    mutationFn: () => commentApi.deleteReaction(post.id, 'POST')
  })

  function handleReactionClick(type: ReactionType) {
    setSelectedReaction(type)
    setShowReactionPicker(false)
    toggleMutation.mutate(type)
  }

  const isMutating =
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending ||
    toggleReactionMutation.isPending ||
    deleteReactionMutation.isPending

  async function handleCreateComment(content: string, parentId?: string) {
    await createCommentMutation.mutateAsync({
      content,
      ...(parentId ? { parentId } : {})
    })

    setReplyTarget(null)
  }

  async function handleUpdateComment(commentId: string, content: string) {
    await updateCommentMutation.mutateAsync({
      commentId,
      payload: {
        content
      }
    })
  }

  async function handleDeleteComment(commentId: string) {
    await deleteCommentMutation.mutateAsync(commentId)
  }

  async function handleToggleCommentReaction(commentId: string, type: ReactionType) {
    await toggleReactionMutation.mutateAsync({
      commentId,
      type
    })
  }

  async function handleRemoveCommentReaction(commentId: string) {
    await deleteReactionMutation.mutateAsync(commentId)
  }

  const modalMedia = mediaOverride?.length ? mediaOverride : (post.media ?? [])
  const sortedMedia = [...modalMedia].sort((a, b) => {
    if (a.type === 'VIDEO' && b.type !== 'VIDEO') return -1
    if (a.type !== 'VIDEO' && b.type === 'VIDEO') return 1
    return 0
  })

  const VisibilityIcon = post.visibility === 'Public' ? Globe : post.visibility === 'Friends' ? Users : Globe
  const visibilityLabel = text.post.visibility[post.visibility]
  const defaultPostedAtLabel = language.startsWith('vi') ? 'Vừa xong' : 'Just now'
  const postedAtLabel = formatRelativeTime(post.postedAt, language) || defaultPostedAtLabel
  
  const displayedTopReactions =
    selectedReaction && !post.topReactions?.includes(selectedReaction)
      ? [selectedReaction, ...(post.topReactions ?? []).slice(0, 2)]
      : (post.topReactions ?? []).slice(0, 3)
  const topReactionOptions = displayedTopReactions
    .map((type) => REACTIONS.find((reaction) => reaction.type === type))
    .filter((reaction): reaction is (typeof REACTIONS)[number] => Boolean(reaction))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className='max-w-none w-screen h-screen sm:max-w-none p-0 m-0 border-none bg-black/95 rounded-none flex flex-col md:flex-row overflow-hidden duration-300 gap-0 !top-0 !left-0 !translate-x-0 !translate-y-0'
      >
        <DialogTitle className='sr-only'>Post media viewer</DialogTitle>
        {/* Left Side: 70% Media Carousel */}
        <div className='w-full md:w-[70%] md:flex-[0_0_70%] h-[50%] md:h-full shrink-0 flex flex-col items-center justify-center relative overflow-hidden'>
          {sortedMedia.length === 0 ? (
            <div className='flex h-full w-full items-center justify-center px-6 text-center text-sm text-zinc-300'>
              No media available for this post.
            </div>
          ) : (
            <Carousel
              opts={{ align: 'center', startIndex: initialSlide }}
              className='w-full h-full [&_[data-slot=carousel-content]]:h-full'
            >
              <CarouselContent className='h-full !ml-0'>
                {sortedMedia.map((item, index) => (
                  <CarouselItem key={`${item.url}-${index}`} className='h-full !pl-0 flex items-center justify-center'>
                    {item.type === 'VIDEO' ? (
                      <VideoPlayer
                        src={item.url}
                        controls
                        autoplay
                        className='h-full w-full'
                        videoClassName='h-full w-full'
                        objectFit='contain'
                        ariaLabel={text.post.attachmentAlt(post.authorName)}
                        preload='metadata'
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={`${text.post.attachmentAlt(post.authorName)} ${index + 1}`}
                        className='h-full w-full object-contain'
                        loading='lazy'
                        decoding='async'
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
              {sortedMedia.length > 1 && (
                <>
                  <CarouselPrevious className='left-4 lg:left-8 bg-zinc-800/50 hover:bg-zinc-700/80 text-white border-none h-12 w-12' />
                  <CarouselNext className='right-4 lg:right-8 bg-zinc-800/50 hover:bg-zinc-700/80 text-white border-none h-12 w-12' />
                </>
              )}
            </Carousel>
          )}
        </div>

        {/* Right Side: 30% Comments and Details */}
        <div className='w-full md:w-[30%] h-[50%] md:h-full bg-white dark:bg-zinc-950 flex flex-col border-l border-white/10 shrink-0'>
          {/* Header */}
          <div className='flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/10'>
            <div className='flex items-center gap-3'>
              <UserAvatar
                name={post.authorName}
                src={post.authorAvatar}
                className='h-10 w-10 border border-zinc-200 dark:border-white/5 shadow-sm'
              />
              <div>
                <div className='text-[14.5px] font-semibold text-zinc-900 dark:text-[#ececec] hover:underline cursor-pointer'>
                  {post.authorName}
                </div>
                <div className='flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500'>
                  <span>{postedAtLabel}</span>
                  <div className='flex items-center gap-1' title={visibilityLabel}>
                    <VisibilityIcon className='h-3 w-3' />
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant='ghost'
              size='icon-sm'
              className='rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-300'
            >
              <MoreHorizontal className='h-5 w-5' />
            </Button>
          </div>

          {/* Post Content */}
          <div className='px-5 py-3 border-b border-zinc-200 dark:border-white/10 shrink-0'>
            <p className='text-[14.5px] leading-relaxed text-zinc-800 dark:text-zinc-300 whitespace-pre-line wrap-break-word'>
              {post.content}
            </p>
            <div className='flex items-center justify-between pt-4 text-[13px] text-zinc-500'>
              <button
                type='button'
                onClick={() => setReactionPeopleModalOpen(true)}
                className='flex items-center gap-1.5 rounded-md transition-colors hover:text-indigo-500 dark:hover:text-indigo-400'
              >
                {topReactionOptions.length > 0 ? (
                  <div className='flex items-center'>
                    {topReactionOptions.map((reaction, index) => (
                      <div
                        key={`${reaction.type}-${index}`}
                        className={`flex h-5 w-5 items-center justify-center rounded-full border border-white bg-zinc-100 text-[11px] leading-none dark:border-zinc-900 dark:bg-zinc-800 ${index > 0 ? '-ml-1.5' : ''}`}
                        title={text.reactions.labels[reaction.type]}
                      >
                        <reaction.Icon size={14} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 dark:bg-indigo-500/20'>
                    {activeReaction ? (
                      <activeReaction.Icon size={14} />
                    ) : (
                      <ThumbsUp className='h-3 w-3 fill-indigo-500 text-indigo-500' />
                    )}
                  </div>
                )}
                <span>{reactionsCount}</span>
              </button>
              <div className='flex items-center gap-2'>
                <span>{text.post.commentCount(post.comments)}</span>
                <span>{text.post.shareCount(post.shares)}</span>
                {post.views !== undefined && post.views > 0 && (
                  <span className='flex items-center gap-1'>
                    <Eye className='h-3.5 w-3.5' />
                    {post.views}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex w-full gap-1 border-b border-zinc-200 dark:border-white/10 px-2 py-1 shrink-0'>
            <div
              className='relative flex-1'
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              <ReactionPicker open={showReactionPicker} onSelect={handleReactionClick} />

              <Button
                variant='ghost'
                className={`h-9 w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${activeReaction ? activeReaction.textClass : 'text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
                onClick={() => {
                  if (selectedReaction) {
                    setSelectedReaction(null)
                    deleteMutation.mutate()
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
                    <activeReaction.Icon size={18} />
                  ) : (
                    <ThumbsUp className='h-4 w-4 transition-colors' />
                  )}
                </motion.div>
                <span className='text-[13px] font-semibold'>
                  {activeReaction ? text.reactions.labels[activeReaction.type] : text.reactions.labels.LIKE}
                </span>
              </Button>
            </div>
            <Button
              variant='ghost'
              className='h-9 flex-1 gap-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-500 dark:hover:text-indigo-400'
              onClick={() => {
                const commentInput = document.querySelector('textarea');
                if (commentInput) {
                  commentInput.focus();
                }
              }}
            >
              <MessageCircle className='h-4 w-4' />
              <span className='text-[13px] font-semibold'>{text.post.comment}</span>
            </Button>
            <Button
              variant='ghost'
              className='h-9 flex-1 gap-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-500 dark:hover:text-indigo-400'
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className='h-4 w-4' />
              <span className='text-[13px] font-semibold'>{text.post.share}</span>
            </Button>
          </div>

          {/* Comments Flex list */}
          <div className='flex-1 overflow-y-auto px-5 py-4 custom-scrollbar space-y-4'>
            {commentsQuery.isLoading ? (
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>Loading comments...</p>
            ) : commentsQuery.isError ? (
              <p className='text-sm text-red-500'>Unable to load comments.</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
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
              ))
            ) : (
              <div className='flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 px-4 text-center dark:border-white/10'>
                <MessageCircle className='mb-2 h-5 w-5 text-zinc-400' />
                <p className='text-[13px] font-medium text-zinc-500 dark:text-zinc-400'>{text.commentsModal.empty}</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className='p-4 border-t border-zinc-200 dark:border-white/10 shrink-0'>
            <CommentInput
              placeholder={text.commentsModal.inputPlaceholder}
              isSubmitting={createCommentMutation.isPending}
              replyTarget={replyTarget ? { id: replyTarget.id, authorName: replyTarget.authorName } : null}
              onCancelReply={() => setReplyTarget(null)}
              onSubmit={handleCreateComment}
            />
          </div>
        </div>

        {/* Close Button layer on top of media */}
        <button
          onClick={() => onOpenChange(false)}
          className='absolute top-4 left-4 z-50 rounded-full bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M18 6 6 18' />
            <path d='m6 6 12 12' />
          </svg>
        </button>

        {reactionPeopleModalOpen && (
          <ReactionPeopleModal
            open={reactionPeopleModalOpen}
            onOpenChange={setReactionPeopleModalOpen}
            targetId={post.id}
            targetType='POST'
            initialReactionType={topReactionOptions[0]?.type ?? 'LIKE'}
          />
        )}
        {shareModalOpen && (
          <SharePostModal open={shareModalOpen} onOpenChange={setShareModalOpen} post={post} />
        )}
      </DialogContent>
    </Dialog>
  )
}
