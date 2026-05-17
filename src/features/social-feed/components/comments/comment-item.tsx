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
import { PATHS } from '@/constants/path'

interface CommentItemProps {
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
  const hasReplies = (comment.replyCount ?? 0) > 0
  const repliesQuery = useSocialCommentReplies(postId, comment.id, showReplies && hasReplies)
  const replies = repliesQuery.data ?? []

  const activeReaction = selectedReaction ? REACTIONS.find((reaction) => reaction.type === selectedReaction) : null
  const hadReactionOnLoad = Boolean(comment.currentUserReaction)
  const reactionsCount =
    (comment.reactions ?? 0) +
    (!hadReactionOnLoad && selectedReaction ? 1 : 0) +
    (hadReactionOnLoad && !selectedReaction ? -1 : 0)
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
    toggleMutation.mutate(type)
    // keep prop callback for external callers
    if (onToggleReaction) await onToggleReaction(comment.id, type)
  }

  async function handleReactionClick() {
    if (selectedReaction) {
      setSelectedReaction(null)
      deleteMutation.mutate()
      if (onRemoveReaction) await onRemoveReaction(comment.id)
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
            <p className='whitespace-pre-line text-[13.5px] leading-relaxed text-zinc-800 dark:text-zinc-200'>
              {comment.content}
            </p>
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
                className='ml-1 inline-flex items-center justify-center rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors'
              >
                {reactionsCount}
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
    </div>
  )
}
