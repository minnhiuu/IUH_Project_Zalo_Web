import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle, Send, MoreHorizontal, EyeOff, Flag, Eye } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useNavigate } from 'react-router'
import { UserAvatar } from '@/components/common/user-avatar'
import type { SocialPost } from '../post/post-card'
import { ReelCard } from './reel-card'
import { useSocialText } from '../../i18n/use-social-text'
import { interactionApi } from '../../api/interaction.api'
import { REACTIONS, type ReactionType } from '../post/reaction-picker'
import { useToggleReelReactionMutation, useDeleteReelReactionMutation } from '../../queries/use-mutations'
import { motion, AnimatePresence } from 'framer-motion'
import { SharePostModal } from '../post/share-post-modal'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ReportContentDialog } from '@/features/report/components/report-content-dialog'
import { useDislikePostMutation } from '../../queries/use-mutations'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { PATHS } from '@/constants/path'
import { toast } from 'sonner'

interface ReelsFeedProps {
  reels: SocialPost[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  onCommentClick?: (reel: SocialPost) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

function ReelCardSkeleton() {
  return <Skeleton className='h-full w-full rounded-none' />
}

function ReelViewportItem({
  reel,
  isActive,
  onCommentClick
}: {
  reel: SocialPost
  isActive: boolean
  onCommentClick?: (reel: SocialPost) => void
}) {
  // Reaction state — initialise from the value returned by the server (currentUserReaction)
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    (reel.currentUserReaction as ReactionType) ?? null
  )
  const navigate = useNavigate()
  const { user: me } = useAuthContext()
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [localShareCount, setLocalShareCount] = useState(0)
  const hasTrackedView = useRef(false)
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleReactionMutation = useToggleReelReactionMutation()
  const deleteReactionMutation = useDeleteReelReactionMutation()
  const { mutate: dislikePost } = useDislikePostMutation()
  const [isHidden, setIsHidden] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  function handleNotInterested() {
    setIsHidden(true)
    dislikePost(reel.id, {
      onError: () => {
        setIsHidden(false)
        toast.error('Failed to hide reel')
      }
    })
  }

  function handleAuthorClick() {
    if (!reel.authorId) return
    if (me?.id && reel.authorId === me.id) {
      navigate(PATHS.USER.PROFILE)
    } else {
      navigate(PATHS.USER.OTHER_PROFILE.replace(':userId', reel.authorId))
    }
  }

  const recordView = useCallback(() => {
    interactionApi.recordView(reel.id).catch(() => {
      // Best-effort — silently ignore errors
    })
  }, [reel.id])

  useEffect(() => {
    if (hasTrackedView.current) return

    if (isActive) {
      viewTimerRef.current = setTimeout(() => {
        if (hasTrackedView.current) return
        hasTrackedView.current = true
        recordView()
      }, 500)
    } else {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current)
        viewTimerRef.current = null
      }
    }

    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current)
        viewTimerRef.current = null
      }
    }
  }, [isActive, recordView])

  const hadReactionOnLoad = Boolean(reel.currentUserReaction)
  const reactionsCount = useMemo(
    () =>
      reel.reactions +
      (!hadReactionOnLoad && selectedReaction ? 1 : 0) +
      (hadReactionOnLoad && !selectedReaction ? -1 : 0),
    [reel.reactions, hadReactionOnLoad, selectedReaction]
  )

  const activeReaction = selectedReaction
    ? REACTIONS.find((r) => r.type === selectedReaction) ?? null
    : null

  function handleReactionClick(type: ReactionType) {
    setShowReactionPicker(false)
    const previousReaction = selectedReaction

    if (selectedReaction === type) {
      // Un-react
      setSelectedReaction(null)
      deleteReactionMutation.mutate(reel.id, {
        onError: () => setSelectedReaction(previousReaction)
      })
    } else {
      // React / change reaction
      setSelectedReaction(type)
      toggleReactionMutation.mutate({ postId: reel.id, type }, {
        onError: () => setSelectedReaction(previousReaction)
      })
    }
  }

  function handleReactionButtonClick() {
    if (selectedReaction) {
      const previousReaction = selectedReaction
      setSelectedReaction(null)
      deleteReactionMutation.mutate(reel.id, {
        onError: () => setSelectedReaction(previousReaction)
      })
    } else {
      handleReactionClick('LIKE')
    }
  }

  function handleShareClick() {
    setShareModalOpen(true)
  }

  if (isHidden) {
    return (
      <div className='relative flex h-full w-full items-center justify-center bg-transparent py-2 md:py-4 transition-colors duration-500'>
        <div className='relative flex w-full max-w-[400px] items-center justify-center h-[100dvh] md:h-[90dvh] bg-black/80 md:rounded-xl'>
          <div className='flex flex-col items-center gap-3 text-white/70'>
            <EyeOff className='h-8 w-8' />
            <span className='text-[15px] font-medium'>Reel hidden</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex h-full w-full items-center justify-center bg-transparent py-2 md:py-4 transition-colors duration-500'>
      <div className='relative flex w-full max-w-[400px] items-end justify-center h-[100dvh] md:h-[90dvh]'>
        
        {/* Reel Video Container */}
        <div className='relative h-[100dvh] md:h-full w-full shrink-0 md:rounded-xl shadow-none md:shadow-2xl overflow-hidden bg-black group'>
          <ReelCard reel={reel} isActive={isActive} />

          {/* Overlay: Text */}
          <div className='absolute bottom-0 left-0 right-14 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-10 pt-12 md:right-0 text-white pointer-events-none'>
            <div className='mb-3 flex items-center gap-3'>
              <button type='button' onClick={handleAuthorClick} className='h-10 w-10 shrink-0 pointer-events-auto transition hover:scale-105'>
                <UserAvatar
                  name={reel.authorName}
                  src={reel.authorAvatar}
                  className='w-full h-full border border-white/20'
                  fallbackClassName='bg-primary text-white text-[11px]'
                />
              </button>
              <button type='button' onClick={handleAuthorClick} className='text-[15px] font-bold tracking-wide drop-shadow-md hover:underline pointer-events-auto'>
                {reel.authorName}
              </button>
            </div>
            <p className='line-clamp-3 whitespace-pre-line text-[14px] leading-relaxed text-white/90 drop-shadow-md pointer-events-auto'>
              {reel.content}
            </p>
          </div>
        </div>

        {/* Right Overlay: Actions */}
        <div className='absolute bottom-6 right-2 z-30 flex flex-col items-center gap-5 md:-right-16 md:bottom-6'>
          {/* Reaction button with popover picker */}
          <div
            className='relative flex flex-col items-center gap-1.5'
            onMouseEnter={() => setShowReactionPicker(true)}
            onMouseLeave={() => setShowReactionPicker(false)}
          >
            {/* Floating reaction picker */}
            <AnimatePresence>
              {showReactionPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.92 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className='absolute bottom-full pb-2 right-0 md:left-1/2 md:-translate-x-1/2 z-50 w-max'
                >
                  <div className='flex w-max items-center gap-1 rounded-2xl border border-white/10 bg-black/80 px-2 py-2 shadow-2xl backdrop-blur-xl'>
                    {REACTIONS.map((reaction, i) => (
                      <motion.button
                        key={reaction.type}
                        type='button'
                        title={reaction.type}
                        onClick={() => handleReactionClick(reaction.type)}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.13, delay: 0.03 * i }}
                        whileHover={{ scale: 1.2, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                          selectedReaction === reaction.type
                            ? 'bg-white/25 ring-1 ring-white/50'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <reaction.Icon size={28} />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type='button'
              onClick={handleReactionButtonClick}
              className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-zinc-300'
            >
              <motion.span
                whileTap={{ scale: 0.85 }}
                animate={selectedReaction ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.3 }}
                className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800/80 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 md:hover:bg-zinc-200 md:dark:hover:bg-zinc-700/80 active:scale-95'
              >
                {activeReaction ? (
                  <activeReaction.Icon size={24} />
                ) : (
                  <svg viewBox='0 0 24 24' className='h-6 w-6 text-white md:text-zinc-700 md:dark:text-white transition-colors group-hover:text-white md:group-hover:text-zinc-900 md:dark:group-hover:text-white' fill='none' stroke='currentColor' strokeWidth={2}>
                    <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
                  </svg>
                )}
              </motion.span>
              <span className='text-[11px] md:text-xs font-bold drop-shadow-md md:drop-shadow-none md:dark:drop-shadow-md'>{reactionsCount}</span>
            </button>
          </div>

          <button
            type='button'
            className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-zinc-300 cursor-default'
          >
            <span className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800/80 shadow-xl backdrop-blur-xl'>
              <Eye className='h-6 w-6 text-white md:text-zinc-700 md:dark:text-white' />
            </span>
            <span className='text-[11px] md:text-xs font-bold drop-shadow-md md:drop-shadow-none md:dark:drop-shadow-md'>{reel.views ?? 0}</span>
          </button>

          <button
            type='button'
            onClick={() => onCommentClick?.(reel)}
            className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-zinc-300'
          >
            <span className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800/80 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 md:hover:bg-zinc-200 md:dark:hover:bg-zinc-700/80 active:scale-95'>
              <MessageCircle className='h-6 w-6 text-white md:text-zinc-700 md:dark:text-white transition-colors duration-300 group-hover:text-white md:group-hover:text-zinc-900 md:dark:group-hover:text-white' />
            </span>
            <span className='text-[11px] md:text-xs font-bold drop-shadow-md md:drop-shadow-none md:dark:drop-shadow-md'>{reel.comments}</span>
          </button>

          <button
            type='button'
            onClick={handleShareClick}
            className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-zinc-300'
          >
            <span className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800/80 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 md:hover:bg-zinc-200 md:dark:hover:bg-zinc-700/80 active:scale-95'>
              <Send className='h-6 w-6 pr-0.5 text-white md:text-zinc-700 md:dark:text-white transition-colors duration-300 group-hover:text-white md:group-hover:text-zinc-900 md:dark:group-hover:text-white' />
            </span>
            <span className='text-[11px] md:text-xs font-bold drop-shadow-md md:drop-shadow-none md:dark:drop-shadow-md'>{reel.shares + localShareCount}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-zinc-300'>
                <span className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800/80 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 md:hover:bg-zinc-200 md:dark:hover:bg-zinc-700/80 active:scale-95'>
                  <MoreHorizontal className='h-6 w-6 text-white md:text-zinc-700 md:dark:text-white transition-colors duration-300 group-hover:text-white md:group-hover:text-zinc-900 md:dark:group-hover:text-white' />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuItem onClick={handleNotInterested} className='gap-2 text-[13.5px]'>
                <EyeOff className='h-4 w-4' />
                Not interested
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setReportDialogOpen(true)}
                className='gap-2 text-[13.5px] text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400'
              >
                <Flag className='h-4 w-4' />
                Report reel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share reel modal */}
          {shareModalOpen && (
            <SharePostModal
              open={shareModalOpen}
              onOpenChange={(open) => {
                setShareModalOpen(open)
                if (!open) setLocalShareCount((c) => c + 1)
              }}
              post={reel}
            />
          )}

          <ReportContentDialog
            open={reportDialogOpen}
            onOpenChange={setReportDialogOpen}
            targetId={reel.id}
            targetType='POST'
          />
        </div>
      </div>
    </div>
  )
}

export function ReelsFeed({
  reels,
  isLoading = false,
  isError = false,
  onRetry,
  scrollContainerRef,
  onCommentClick,
  onLoadMore,
  hasMore,
  isLoadingMore
}: ReelsFeedProps) {
  const { text } = useSocialText()
  const [activeIndex, setActiveIndex] = useState(0)
  const activeReelId = reels[Math.min(activeIndex, Math.max(reels.length - 1, 0))]?.id

  const stateRef = useRef({ hasMore, isLoadingMore, onLoadMore, length: reels.length })
  useEffect(() => {
    stateRef.current = { hasMore, isLoadingMore, onLoadMore, length: reels.length }
  }, [hasMore, isLoadingMore, onLoadMore, reels.length])

  useEffect(() => {
    const container = scrollContainerRef?.current
    if (!container || reels.length === 0) {
      return
    }

    const updateActiveIndex = () => {
      const viewportHeight = Math.max(container.clientHeight, 1)
      const nextIndex = Math.round(container.scrollTop / viewportHeight)
      const clampedIndex = Math.max(0, Math.min(reels.length - 1, nextIndex))
      setActiveIndex(clampedIndex)

      if (clampedIndex >= stateRef.current.length - 2 && stateRef.current.hasMore && !stateRef.current.isLoadingMore) {
        stateRef.current.onLoadMore?.()
      }
    }

    updateActiveIndex()
    container.addEventListener('scroll', updateActiveIndex, { passive: true })

    return () => {
      container.removeEventListener('scroll', updateActiveIndex)
    }
  }, [reels.length, scrollContainerRef])

  if (isLoading) {
    return (
      <div className='h-full overflow-y-auto'>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className='flex h-full snap-start items-center justify-center'>
            <ReelCardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className='rounded-2xl border border-dashed border-red-300 bg-red-50/70 px-5 py-10 text-center text-[14px] font-medium text-red-700 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300'>
        <p className='mb-4'>{text.reels.loadFailed}</p>
        <Button variant='outline' onClick={() => onRetry?.()}>
          {text.reels.retry}
        </Button>
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-5 py-10 text-center text-[14px] font-medium text-zinc-500 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-400'>
        {text.reels.empty}
      </div>
    )
  }

  return (
    <div ref={scrollContainerRef} className='hide-scrollbar h-full snap-y snap-mandatory overflow-y-auto'>
      {reels.map((reel) => (
        <div key={reel.id} className='flex h-full snap-start items-center justify-center'>
          <ReelViewportItem reel={reel} isActive={reel.id === activeReelId} onCommentClick={onCommentClick} />
        </div>
      ))}
    </div>
  )
}
