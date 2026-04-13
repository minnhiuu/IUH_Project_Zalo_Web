import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { ReelsFeed, useInfiniteSocialReels } from '@/features/social-feed'
import { ReelCommentsSidebar } from '@/features/social-feed/components/reels/reel-comments-sidebar'
import type { SocialPost } from '@/features/social-feed'


export default function ReelsPage({ query = '' }: { query?: string }) {
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [selectedCommentReel, setSelectedCommentReel] = useState<SocialPost | null>(null)
  const reelsScrollContainerRef = useRef<HTMLDivElement | null>(null)
  const lastClickTimeRef = useRef(0)
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSocialReels(20)
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

      <div className='pointer-events-none absolute inset-0 z-0'>
        <div className='absolute -left-24 top-28 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl' />
        <div className='absolute right-0 bottom-10 h-80 w-80 rounded-full bg-indigo-500/14 blur-3xl' />
      </div>

      <div className='relative z-10 h-[calc(100dvh-4.5rem)] w-full'>
        <div className='relative flex h-full min-w-0 w-full flex-col'>


          <ReelsFeed
            reels={filteredReels}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            scrollContainerRef={reelsScrollContainerRef}
            onCommentClick={(reel) => setSelectedCommentReel(reel)}
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
              className='pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-zinc-900/75 text-white shadow-lg backdrop-blur-md transition hover:bg-zinc-800/90 disabled:cursor-not-allowed disabled:opacity-30'
              aria-label='Previous reel'
            >
              <ChevronUp className='h-5 w-5' />
            </button>

            <button
              type='button'
              onClick={handleScrollDown}
              disabled={(!canScrollDown && !hasNextPage) || isFetchingNextPage}
              className='pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-zinc-900/75 text-white shadow-lg backdrop-blur-md transition hover:bg-zinc-800/90 disabled:cursor-not-allowed disabled:opacity-30'
              aria-label='Next reel'
            >
              {isFetchingNextPage ? <Loader2 className='h-5 w-5 animate-spin' /> : <ChevronDown className='h-5 w-5' />}
            </button>
          </div>

          {selectedCommentReel ? (
            <ReelCommentsSidebar post={selectedCommentReel} onClose={() => setSelectedCommentReel(null)} />
          ) : null}
        </div>
      </div>
    </section>
  )
}
