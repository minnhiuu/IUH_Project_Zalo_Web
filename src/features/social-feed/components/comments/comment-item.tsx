import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Reply, ThumbsUp, Flag } from 'lucide-react'
import { REACTIONS, ReactionPicker, type ReactionType } from '../post/reaction-picker'
import { ReactionPeopleModal } from '../post/reaction-people-modal'
import { useSocialText } from '../../i18n/use-social-text'
import type { SocialFeedComment } from '../../schemas/comment.schema'
import { formatRelativeTime } from '@/utils/date'
import { useSocialCommentReplies } from '../../queries/use-queries'
import { commentApi } from '../../api/comment.api'
import { socialFeedCommentKeys } from '../../queries/keys'
import { ReportContentDialog } from '@/features/report/components/report-content-dialog'
import { useNavigate } from 'react-router'
import { useCreateSocialCommentMutation, useDeleteSocialCommentMutation, useDeleteSocialCommentReactionMutation, useToggleSocialCommentReactionMutation, useUpdateSocialCommentMutation } from '../../queries/use-mutations'
import { MediaSection } from '../post/media-section'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { VideoPlayer } from '@/components/common/video-player'
import { X } from 'lucide-react'

export interface CommentItemProps {
  comment: SocialFeedComment
  postId: string
  currentUserId?: string
  currentUserAvatar?: string | null
  isMutating?: boolean
  onReply?: (comment: SocialFeedComment) => void
  onDelete?: (commentId: string) => Promise<void>
  onUpdate?: (commentId: string, content: string) => Promise<void>
  onToggleReaction?: (commentId: string, reactionType: ReactionType) => Promise<void>
  onRemoveReaction?: (commentId: string) => Promise<void>
}

export function CommentItem({
  comment,
  postId,
  currentUserId,
  currentUserAvatar,
  isMutating = false,
  onReply,
  onDelete,
  onUpdate,
  onToggleReaction,
  onRemoveReaction
}: CommentItemProps) {
  const { text, language } = useSocialText()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    (comment.currentUserReaction as ReactionType) ?? null
  )
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showReactionModal, setShowReactionModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftContent, setDraftContent] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false)
  const [initialMediaSlide, setInitialMediaSlide] = useState(0)
  const hasReplies = (comment.replyCount ?? 0) > 0
  const repliesQuery = useSocialCommentReplies(postId, comment.id, showReplies && hasReplies)
  const replies = repliesQuery.data ?? []

  const activeReaction = selectedReaction ? REACTIONS.find((reaction) => reaction.type === selectedReaction) : null
  const hadReactionOnLoad = Boolean(comment.currentUserReaction)
  const reactionsCount =
    (comment.reactions ?? 0) +
    (!hadReactionOnLoad && selectedReaction ? 1 : 0) +
    (hadReactionOnLoad && !selectedReaction ? -1 : 0)
  const displayedTopReactions =
    selectedReaction && !comment.topReactions?.includes(selectedReaction)
      ? [selectedReaction, ...(comment.topReactions ?? []).slice(0, 2)]
      : (comment.topReactions ?? []).slice(0, 3)
  const topReactionOptions = displayedTopReactions
    .map((type) => REACTIONS.find((reaction) => reaction.type === type))
    .filter((reaction): reaction is (typeof REACTIONS)[number] => Boolean(reaction))

  const isOwner = Boolean(currentUserId) && currentUserId === comment.authorId
  const effectiveAuthorAvatar = comment.authorAvatar ?? (isOwner ? (currentUserAvatar ?? null) : null)
  const defaultCreatedAtLabel = text.post.justNow
  const createdAtLabel = formatRelativeTime(comment.createdAt, language) || defaultCreatedAtLabel

  const toggleMutation = useMutation({
    mutationFn: (type: ReactionType) =>
      commentApi.toggleReaction({ targetId: comment.id, targetType: 'COMMENT', type }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialFeedCommentKeys.byPost(comment.postId) })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => commentApi.deleteReaction(comment.id, 'COMMENT'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialFeedCommentKeys.byPost(comment.postId) })
    }
  })

  async function handleReactionSelect(type: ReactionType) {
    setSelectedReaction(type)
    setShowReactionPicker(false)
    if (onToggleReaction) {
      await onToggleReaction(comment.id, type)
    } else {
      toggleMutation.mutate(type)
    }
  }

  async function handleReactionClick() {
    if (selectedReaction) {
      setSelectedReaction(null)
      if (onRemoveReaction) {
        await onRemoveReaction(comment.id)
      } else {
        deleteMutation.mutate()
      }
      return
    }
    await handleReactionSelect('LIKE')
  }

  async function handleSaveEdit() {
    const nextContent = draftContent.trim()
    if (!nextContent || !onUpdate) {
      return
    }

    await onUpdate(comment.id, nextContent)
    setIsEditing(false)
  }

  async function handleDelete() {
    if (!onDelete) {
      return
    }

    await onDelete(comment.id)
  }

  function handleAuthorClick(e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation()
    }
    if (!comment.authorId) return
    if (currentUserId && comment.authorId === currentUserId) {
      navigate(PATHS.USER.PROFILE)
    } else {
      navigate(PATHS.USER.OTHER_PROFILE.replace(':userId', comment.authorId))
    }
  }

  return (
    <div className='group flex items-start gap-2.5 w-full py-1 transition-all'>
      <div className='mt-1 h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105'>
        <button onClick={handleAuthorClick} className='w-full h-full rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'>
          <UserAvatar
            name={comment.authorName}
            src={effectiveAuthorAvatar}
            className='w-full h-full border border-background'
            fallbackClassName='bg-primary text-white text-[11px] font-semibold'
          />
        </button>
      </div>
      <div className='min-w-0 flex-1 space-y-1'>
        <div className='relative inline-block max-w-[calc(100%-2rem)] rounded-2xl rounded-tl-sm bg-zinc-100 px-3.5 py-2 dark:bg-zinc-900 shadow-sm border border-transparent dark:border-white/5'>
          <div className='flex items-center gap-2 mb-0.5'>
            <button onClick={handleAuthorClick} className='text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:text-primary dark:hover:text-primary cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded'>
              {comment.authorName}
            </button>
            {comment.isEdited ? (
              <span className='text-[11px] font-medium text-zinc-500/80 dark:text-zinc-500'>
                {text.commentItem.edited}
              </span>
            ) : null}
          </div>
          {isEditing ? (
            <div className='mt-2 animate-in fade-in zoom-in-95 duration-200'>
              <textarea
                value={draftContent}
                onChange={(event) => setDraftContent(event.target.value)}
                className='w-full min-w-[200px] resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-[14px] text-zinc-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-primary dark:focus:ring-primary transition-all'
                rows={3}
              />
              <div className='mt-2.5 flex items-center justify-end gap-2'>
                <button
                  type='button'
                  disabled={isMutating}
                  onClick={() => {
                    setDraftContent(comment.content)
                    setIsEditing(false)
                  }}
                  className='rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors'
                >
                  {text.commentItem.cancel}
                </button>
                <button
                  type='button'
                  disabled={isMutating || !draftContent.trim()}
                  onClick={handleSaveEdit}
                  className='rounded-full bg-primary/90 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:bg-primary dark:hover:bg-primary/90 dark:focus:ring-offset-zinc-950 transition-all'
                >
                  {text.commentItem.save}
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-1.5'>
              {comment.content ? (
                <p className='whitespace-pre-line text-[13.5px] leading-relaxed text-zinc-800 dark:text-zinc-200'>
                  {comment.content}
                </p>
              ) : null}
              {comment.media && comment.media.length > 0 ? (
                <div className='mt-2 rounded-xl overflow-hidden shadow-sm'>
                  <MediaSection
                    media={comment.media}
                    attachmentAlt='Comment attachment'
                    onMediaClick={(index) => {
                      setInitialMediaSlide(index)
                      setMediaViewerOpen(true)
                    }}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
        <div className='mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pl-1'>
          <p className='text-[12px] font-medium text-zinc-500/80 dark:text-zinc-500'>{createdAtLabel}</p>
          <div
            className='relative flex items-center'
            onMouseEnter={() => setShowReactionPicker(true)}
            onMouseLeave={() => setShowReactionPicker(false)}
          >
            <ReactionPicker open={showReactionPicker} onSelect={handleReactionSelect} />
            <Button
              variant='ghost'
              disabled={isMutating}
              className={`h-6 gap-1 px-1.5 transition-all hover:bg-zinc-100 dark:hover:bg-primary/10 ${
                activeReaction
                  ? activeReaction.textClass
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary'
              }`}
              onClick={handleReactionClick}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                animate={selectedReaction ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {activeReaction ? (
                  <activeReaction.Icon size={14} />
                ) : (
                  <ThumbsUp className='h-3.5 w-3.5 transition-colors' />
                )}
              </motion.div>
              <span className='text-[12px] font-bold'>
                {activeReaction ? text.reactions.labels[activeReaction.type] : text.reactions.labels.LIKE}
              </span>
            </Button>
            {reactionsCount > 0 && (
              <button
                type='button'
                disabled={isMutating}
                onClick={() => setShowReactionModal(true)}
                className='ml-1 inline-flex items-center justify-center gap-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors'
              >
                {topReactionOptions.length > 0 && (
                  <div className='flex items-center'>
                    {topReactionOptions.map((reaction, index) => (
                      <div
                        key={`${reaction.type}-${index}`}
                        className={`flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 ${index > 0 ? '-ml-1.5' : ''}`}
                        title={text.reactions.labels[reaction.type]}
                      >
                        <reaction.Icon size={10} />
                      </div>
                    ))}
                  </div>
                )}
                <span>{reactionsCount}</span>
              </button>
            )}
          </div>
          <button
            type='button'
            disabled={isMutating}
            onClick={() => onReply?.(comment)}
            className='group/reply inline-flex items-center gap-1 text-[12px] font-bold text-zinc-500 transition-all duration-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          >
            <Reply className='h-3.5 w-3.5 transition-transform active:scale-90 group-hover/react:scale-110 group-hover/react:-translate-y-0.5' />
            {text.commentItem.reply}
          </button>
          {hasReplies ? (
            <button
              type='button'
              disabled={isMutating}
              onClick={() => setShowReplies((prev) => !prev)}
              className='group/replies text-[12px] font-bold text-zinc-500 transition-all duration-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:text-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-200'
            >
              {showReplies ? text.commentItem.hideReplies : text.commentItem.viewReplies(comment.replyCount ?? 0)}
            </button>
          ) : null}
          {isOwner ? (
            <>
              <button
                type='button'
                disabled={isMutating}
                onClick={() => setIsEditing(true)}
                className='text-[12px] font-bold text-zinc-500 transition-colors hover:text-primary/90 disabled:text-zinc-400 dark:text-zinc-400 dark:hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
              >
                {text.commentItem.edit}
              </button>
              <button
                type='button'
                disabled={isMutating}
                onClick={handleDelete}
                className='text-[12px] font-bold text-zinc-500 transition-colors hover:text-red-600 disabled:text-zinc-400 dark:text-zinc-400 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50'
              >
                {text.commentItem.delete}
              </button>
            </>
          ) : (
            <button
              type='button'
              disabled={isMutating}
              onClick={() => setReportDialogOpen(true)}
              className='inline-flex items-center gap-1 text-[12px] font-bold text-zinc-500 transition-colors hover:text-red-600 disabled:text-zinc-400 dark:text-zinc-400 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50'
            >
              <Flag className='h-3 w-3' />
              Report
            </button>
          )}
        </div>
        {showReplies ? (
          <div className='relative mt-3 space-y-3 pl-4 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-px before:bg-zinc-200 dark:before:bg-white/10'>
            {repliesQuery.isLoading ? (
              <p className='text-xs text-zinc-500 dark:text-zinc-400'>{text.commentItem.loadingReplies}</p>
            ) : repliesQuery.isError ? (
              <p className='text-xs text-red-500'>{text.commentItem.loadRepliesError}</p>
            ) : replies.length > 0 ? (
              replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  currentUserAvatar={currentUserAvatar}
                  isMutating={isMutating}
                  onReply={onReply}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onToggleReaction={onToggleReaction}
                  onRemoveReaction={onRemoveReaction}
                />
              ))
            ) : (
              <p className='text-xs text-zinc-500 dark:text-zinc-400'>{text.commentItem.noReplies}</p>
            )}
          </div>
        ) : null}
      </div>

      <ReactionPeopleModal
        open={showReactionModal}
        onOpenChange={setShowReactionModal}
        targetId={comment.id}
        targetType='COMMENT'
      />
      <ReportContentDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        targetId={comment.id}
        targetType='COMMENT'
      />
      {comment.media && comment.media.length > 0 && (
        <Dialog open={mediaViewerOpen} onOpenChange={setMediaViewerOpen}>
          <DialogContent className='max-w-screen w-screen h-screen sm:max-w-screen p-0 m-0 border-none bg-black/95 rounded-none flex flex-col overflow-hidden !top-0 !left-0 !translate-x-0 !translate-y-0 !z-[9999]' showCloseButton={false}>
            <DialogTitle className='sr-only'>Comment media viewer</DialogTitle>
            
            <button
              onClick={() => setMediaViewerOpen(false)}
              className='absolute top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors'
              title='Close'
            >
              <X className='h-6 w-6' />
            </button>
            
            <div className='flex-1 w-full h-full flex items-center justify-center relative'>
              <Carousel
                opts={{ align: 'center', startIndex: initialMediaSlide }}
                className='w-full h-full [&_[data-slot=carousel-content]]:h-full'
              >
                <CarouselContent className='h-full !ml-0'>
                  {comment.media.map((item, index) => (
                    <CarouselItem key={`${item.url}-${index}`} className='h-full !pl-0 flex items-center justify-center p-4'>
                      {item.type === 'VIDEO' ? (
                        <VideoPlayer
                          src={item.url}
                          controls
                          autoplay
                          className='h-full w-full'
                          videoClassName='h-full w-full max-h-[90vh]'
                          objectFit='contain'
                          ariaLabel='Comment attachment'
                          preload='metadata'
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`Comment attachment ${index + 1}`}
                          className='max-w-full max-h-full object-contain'
                          loading='lazy'
                          decoding='async'
                        />
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {comment.media.length > 1 && (
                  <>
                    <CarouselPrevious className='left-4 lg:left-8 bg-zinc-800/50 hover:bg-zinc-700/80 text-white border-none h-12 w-12' />
                    <CarouselNext className='right-4 lg:right-8 bg-zinc-800/50 hover:bg-zinc-700/80 text-white border-none h-12 w-12' />
                  </>
                )}
              </Carousel>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
