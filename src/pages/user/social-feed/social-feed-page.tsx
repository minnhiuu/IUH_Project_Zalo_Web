import { useEffect, useMemo, useState, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2, ArrowUp } from 'lucide-react'
import { useLocation } from 'react-router'
import ReelsPage from '@/pages/user/reels/reels-page'
import {
  PostCard,
  SocialSidebar,
  PostComposerLauncher,
  StoriesStrip,
  SuggestedFriendsSidebar,
  SocialFeedHeader,
  useInfiniteSocialFeedPosts,
  useSocialStories
} from '@/features/social-feed'
import { useSocialText } from '@/features/social-feed'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function PostCardSkeleton() {
  return (
    <div className='rounded-2xl border border-zinc-200 bg-white/90 p-5 dark:border-white/10 dark:bg-zinc-950/50'>
      <div className='mb-4 flex items-center gap-3'>
        <Skeleton className='h-11 w-11 rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-36' />
          <Skeleton className='h-3 w-24' />
        </div>
      </div>

      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-11/12' />
      </div>

      <Skeleton className='mt-4 h-64 w-full rounded-xl' />

      <div className='mt-4 flex items-center justify-between border-t border-zinc-200/70 pt-4 dark:border-white/10'>
        <Skeleton className='h-9 w-[31%] rounded-lg' />
        <Skeleton className='h-9 w-[31%] rounded-lg' />
        <Skeleton className='h-9 w-[31%] rounded-lg' />
      </div>
    </div>
  )
}

export default function SocialFeedPage() {
  const { text } = useSocialText()
  const [query, setQuery] = useState('')
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isReels = searchParams.get('tab') === 'reels'
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSocialFeedPosts(20)
  const posts = useMemo(() => data?.pages.flat() ?? [], [data])
  const { data: stories = [], isLoading: isStoriesLoading } = useSocialStories(0, 20)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const handleScrollObject = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 800)
  }

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { ref, inView } = useInView({
    rootMargin: '400px',
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return posts
    }

    return posts.filter((post) => {
      return post.authorName.toLowerCase().includes(normalized) || post.content.toLowerCase().includes(normalized)
    })
  }, [posts, query])

  return (
    <section 
      ref={scrollContainerRef}
      onScroll={handleScrollObject}
      className={`custom-scrollbar flex flex-col h-[100dvh] w-full bg-zinc-50/50 dark:bg-zinc-950/50 ${isReels ? 'overflow-hidden' : 'overflow-y-auto'}`}
    >
      <SocialFeedHeader query={query} onQueryChange={setQuery} placeholder={text.search.placeholder} />

      {isReels ? (
        <ReelsPage query={query} />
      ) : (
        <div className='mx-auto flex w-full max-w-7xl items-start justify-center gap-6 px-4 pb-8 md:px-8 lg:gap-8 pt-6'>
        {/* Left Sidebar */}
        <div className='sticky top-24 self-start'>
          <SocialSidebar />
        </div>

        {/* Center: Main Feed */}
        <div className='mx-auto flex min-w-0 w-full max-w-180 flex-1 flex-col space-y-6 pt-4 pb-10'>
          {/* Post Composer */}
          <PostComposerLauncher />

          {/* Stories */}
          <StoriesStrip stories={stories} isLoading={isStoriesLoading} />

          {/* Feed List */}
          <div className='flex flex-col space-y-6'>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={index} />)
            ) : isError ? (
              <div className='rounded-2xl border border-dashed border-red-300 bg-red-50/70 px-5 py-10 text-center text-[14px] font-medium text-red-700 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300'>
                <p className='mb-4'>Failed to load posts.</p>
                <Button variant='outline' onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : filteredPosts.length > 0 ? (
              <>
                {filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}
                <div ref={ref} className='flex py-6 justify-center text-zinc-500 dark:text-zinc-400'>
                  {isFetchingNextPage && (
                    <div className='flex items-center gap-2 text-[14px] font-medium'>
                      <Loader2 className='h-4 w-4 animate-spin' /> {text.commentsModal.loadingComments || 'Loading...'}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-5 py-10 text-center text-[14px] font-medium text-zinc-500 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-400'>
                {text.search.noResults}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className='sticky top-24 self-start'>
          <SuggestedFriendsSidebar />
        </div>
      </div>
      )}

      {/* Floating Scroll to Top */}
      {showScrollTop && !isReels && (
        <button
          onClick={scrollToTop}
          className='pointer-events-auto fixed bottom-[6rem] right-6 md:right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-indigo-600 hover:shadow-2xl active:scale-95'
          aria-label='Scroll to top'
        >
          <ArrowUp className='h-5 w-5' />
        </button>
      )}
    </section>
  )
}
