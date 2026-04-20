import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { UserAvatar } from '@/components/common/user-avatar'
import type { SocialPost } from '../post/post-card'
import { ReelCard } from './reel-card'
import { useSocialText } from '../../i18n/use-social-text'
import { interactionApi } from '../../api/interaction.api'

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
  const [liked, setLiked] = useState(false)
  const [localShareCount, setLocalShareCount] = useState(0)
  const hasTrackedView = useRef(false)
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const likeCount = useMemo(() => reel.reactions + (liked ? 1 : 0), [reel.reactions, liked])
  const shareCount = reel.shares + localShareCount

  async function handleShare() {
    const reelLink = `${window.location.origin}${window.location.pathname}#reel-${reel.id}`

    try {
      await navigator.clipboard.writeText(reelLink)
    } catch {
      // Ignore clipboard failures (for insecure contexts or denied permissions).
    }

    setLocalShareCount((previous) => previous + 1)
  }

  return (
    <div className='relative flex h-full w-full items-center justify-center bg-transparent px-0 md:px-6 transition-colors duration-500'>
      <div className='relative flex w-full max-w-7xl items-end justify-center md:gap-6 lg:gap-12 h-full md:h-auto'>
        {/* Left: Author & Content (Desktop only, overlayed on mobile) */}
        <div className='hidden md:flex flex-1 flex-col items-end pb-4'>
          <div className='pointer-events-auto w-full max-w-[20rem] rounded-2xl border border-zinc-200 bg-white/90 dark:border-white/10 dark:bg-black/40 p-5 shadow-xl backdrop-blur-xl transition hover:bg-white dark:hover:bg-black/50'>
            <div className='mb-3 flex items-center gap-3'>
              <div className='h-11 w-11'>
                <UserAvatar
                  name={reel.authorName}
                  src={reel.authorAvatar}
                  className='w-full h-full border border-background'
                  fallbackClassName='bg-primary text-white text-xs font-semibold'
                />
              </div>
              <div>
                <p className='text-[15px] font-semibold tracking-wide drop-shadow-sm leading-tight text-zinc-900 dark:text-white'>
                  {reel.authorName}
                </p>
              </div>
            </div>

            <p className='line-clamp-6 whitespace-pre-line text-[14px] leading-relaxed text-zinc-700 dark:text-white/90 drop-shadow-sm'>
              {reel.content}
            </p>
          </div>
        </div>

        {/* Center: Reel Video */}
        <div className='relative h-[100dvh] md:h-[84dvh] md:max-h-[90dvh] w-full max-w-[26rem] shrink-0 md:rounded-3xl shadow-none md:shadow-2xl overflow-hidden shadow-black/20 dark:shadow-black/50 bg-black group'>
          <ReelCard reel={reel} isActive={isActive} />

          {/* Mobile Overlay: Text (Hidden on desktop) */}
          <div className='absolute bottom-0 left-0 right-16 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 md:hidden'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-9 w-9'>
                <UserAvatar
                  name={reel.authorName}
                  src={reel.authorAvatar}
                  className='w-full h-full border border-background'
                  fallbackClassName='bg-primary text-white text-[10px]'
                />
              </div>
              <p className='text-sm font-semibold tracking-wide drop-shadow-md'>{reel.authorName}</p>
            </div>
            <p className='line-clamp-3 whitespace-pre-line text-[13px] leading-relaxed text-white/90 drop-shadow-md'>
              {reel.content}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className='absolute bottom-6 right-2 z-30 flex flex-col items-center gap-6 md:static md:flex-1 md:items-start md:pb-4 md:pl-2'>
          <button
            type='button'
            onClick={() => setLiked((previous) => !previous)}
            className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-white'
          >
            <span className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 md:border-zinc-200 md:bg-white/90 md:dark:border-white/10 md:dark:bg-black/40 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 md:hover:bg-white md:dark:hover:bg-black/60 active:scale-95'>
              <Heart
                className={`h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 ${liked ? 'scale-110 fill-rose-500 text-rose-500' : 'text-white/90 group-hover:text-white md:text-zinc-500 md:group-hover:text-zinc-900 md:dark:text-white/90 md:dark:group-hover:text-white'}`}
              />
            </span>
            <span className='text-[11px] md:text-xs font-bold drop-shadow-md'>{likeCount}</span>
          </button>

          <button
            type='button'
            onClick={() => onCommentClick?.(reel)}
            className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-white'
          >
            <span className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 md:border-zinc-200 md:bg-white/90 md:dark:border-white/10 md:dark:bg-black/40 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 md:hover:bg-white md:dark:hover:bg-black/60 active:scale-95'>
              <MessageCircle className='h-5 w-5 md:h-6 md:w-6 text-white/90 transition-colors duration-300 group-hover:text-white md:text-zinc-500 md:group-hover:text-zinc-900 md:dark:text-white/90 md:dark:group-hover:text-white' />
            </span>
            <span className='text-[11px] md:text-xs font-bold drop-shadow-md'>{reel.comments}</span>
          </button>

          <button
            type='button'
            onClick={handleShare}
            className='group flex flex-col items-center gap-1.5 text-white md:text-zinc-700 md:dark:text-white'
          >
            <span className='inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 md:border-zinc-200 md:bg-white/90 md:dark:border-white/10 md:dark:bg-black/40 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 md:hover:bg-white md:dark:hover:bg-black/60 active:scale-95'>
              <Send className='h-5 w-5 md:h-6 md:w-6 pr-0.5 text-white/90 transition-colors duration-300 group-hover:text-white md:text-zinc-500 md:group-hover:text-zinc-900 md:dark:text-white/90 md:dark:group-hover:text-white' />
            </span>
            <span className='text-[11px] md:text-xs font-bold drop-shadow-md'>{shareCount}</span>
          </button>
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
