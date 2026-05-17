import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { ReelsFeed, useInfiniteSocialReels } from '@/features/social-feed'
import type { SocialPost } from '@/features/social-feed'
import { useSocialText } from '@/features/social-feed'

export default function ReelsPage({ query = '' }: { query?: string }) {
  const { text } = useSocialText()
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [selectedCommentReel, setSelectedCommentReel] = useState<SocialPost | null>(null)
  const reelsScrollContainerRef = useRef<HTMLDivElement | null>(null)
  const lastClickTimeRef = useRef(0)
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteSocialReels(20)
  const reels = useMemo(() => data?.pages.flat() ?? [], [data])

  const filteredReels = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return reels
    }

    return reels.filter((reel) => {
      return reel.authorName.toLowerCase().includes(normalized) || reel.content.toLowerCase().includes(normalized)
    })
  }, [query, reels])

  useEffect(() => {
    const container = reelsScrollContainerRef.current
    if (!container) {
      return
    }

    const updateScrollState = () => {
      const maxScrollTop = container.scrollHeight - container.clientHeight
      setCanScrollUp(container.scrollTop > 8)
      setCanScrollDown(container.scrollTop < maxScrollTop - 8)
    }

    updateScrollState()
    container.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      container.removeEventListener('scroll', updateScrollState)
    }
  }, [filteredReels.length, isLoading, isError])

  function scrollOneReel(direction: 'up' | 'down', bypassThrottle = false) {
    if (!bypassThrottle) {
      const now = Date.now()
      if (now - lastClickTimeRef.current < 500) return false
      lastClickTimeRef.current = now
    }

    const container = reelsScrollContainerRef.current
    if (!container) return false

    const delta = direction === 'down' ? container.clientHeight : -container.clientHeight
    container.scrollBy({
      top: delta,
      behavior: 'smooth'
    })

    return true
  }

  async function handleScrollDown() {
    const now = Date.now()
    if (now - lastClickTimeRef.current < 500) return
    lastClickTimeRef.current = now

    if (!canScrollDown && hasNextPage && !isFetchingNextPage) {
      await fetchNextPage()
      setTimeout(() => scrollOneReel('down', true), 150)
    } else {
      scrollOneReel('down', true)
    }
  }

  return (
    <section className='relative h-full w-full overflow-hidden bg-transparent'>
      <div className='relative z-10 h-full w-full'>
        <div className='relative flex h-full min-w-0 w-full flex-row'>
          {/* Main Content Area */}
          <div className='relative flex flex-1 h-full min-w-0 flex-col'>
            <div className='pointer-events-none absolute left-3 top-3 z-50 md:left-6 md:top-6 flex flex-col items-start gap-4'>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-white drop-shadow-sm'>
                {text.reels?.title || 'Reels'}
              </h1>
            </div>

            <ReelsFeed
              reels={filteredReels}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              scrollContainerRef={reelsScrollContainerRef}
              onCommentClick={(reel) => setSelectedCommentReel(reel)}
              selectedCommentReel={selectedCommentReel}
              onCloseComment={() => setSelectedCommentReel(null)}
              onLoadMore={() => {
                if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
              }}
              hasMore={hasNextPage}
              isLoadingMore={isFetchingNextPage}
            />

            <div className='pointer-events-none absolute right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 md:right-6'>
              <button
                type='button'
                onClick={() => scrollOneReel('up')}
                disabled={!canScrollUp}
                className='pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition hover:scale-105 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-0'
                aria-label='Previous reel'
              >
                <ChevronUp className='h-7 w-7' />
              </button>

              <button
                type='button'
                onClick={handleScrollDown}
                disabled={(!canScrollDown && !hasNextPage) || isFetchingNextPage}
                className='pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition hover:scale-105 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-0'
                aria-label='Next reel'
              >
                {isFetchingNextPage ? (
                  <Loader2 className='h-7 w-7 animate-spin' />
                ) : (
                  <ChevronDown className='h-7 w-7' />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
