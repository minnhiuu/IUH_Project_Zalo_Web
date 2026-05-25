import { useEffect, useMemo, useState, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2, ArrowUp } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import {
  PostCard,
  PostComposerLauncher,
  StoriesStrip,
  SuggestedFriendsSidebar,
  useInfiniteSocialFeedPosts,
  useSocialStories
} from '@/features/social-feed'
import { useSocialText } from '@/features/social-feed'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PostMediaModal } from '@/features/social-feed/components/post/post-media-modal'
import { usePostById } from '@/features/social-feed/queries/use-queries'

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
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const postIdParam = searchParams.get('postId')
  const [detailPostId, setDetailPostId] = useState<string | null>(postIdParam)
  const { data: detailPost } = usePostById(detailPostId ?? '')

  useEffect(() => {
    setDetailPostId(postIdParam)
  }, [postIdParam])

  const handleDetailClose = (open: boolean) => {
    if (!open) {
      setDetailPostId(null)
      // Clean postId from URL without full navigation
      if (postIdParam) {
        navigate(location.pathname, { replace: true })
      }
    }
  }

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteSocialFeedPosts(20)
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
    rootMargin: '400px'
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const filteredPosts = posts

  return (
    <div className='flex w-full h-full overflow-hidden bg-[#f0f2f5] dark:bg-background'>
      {/* Main Content Area */}
      <section
        ref={scrollContainerRef}
        onScroll={handleScrollObject}
        className='flex-1 flex flex-col h-full overflow-hidden relative'
      >
        {/* Subtle Mesh Gradients */}
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-400/5 blur-[120px] rounded-full pointer-events-none' />

        <div className='flex-1 overflow-y-auto custom-scrollbar relative z-10'>
          <div className='mx-auto flex w-full max-w-[1100px] justify-center gap-10 px-4 py-8 lg:py-10'>
            {/* Center: Main Feed */}
            <div className='flex min-w-0 w-full max-w-[680px] flex-col space-y-7 pb-[120px]'>
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
                    {filteredPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    <div ref={ref} className='flex py-6 justify-center text-zinc-500 dark:text-zinc-400'>
                      {isFetchingNextPage && (
                        <div className='flex items-center gap-2 text-[14px] font-medium'>
                          <Loader2 className='h-4 w-4 animate-spin' />{' '}
                          {text.commentsModal.loadingComments || 'Loading...'}
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

            {/* Right Sidebar: Suggestions */}
            <div className='hidden xl:block w-[320px] shrink-0 sticky top-0 self-start space-y-8'>
              <SuggestedFriendsSidebar />
            </div>
          </div>
        </div>

        {/* Floating Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className='pointer-events-auto fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/20 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-2xl active:scale-95'
            aria-label='Scroll to top'
          >
            <ArrowUp className='h-5 w-5' />
          </button>
        )}

        {detailPostId && detailPost && (
          <PostMediaModal open={!!detailPostId} onOpenChange={handleDetailClose} post={detailPost} />
        )}
      </section>
    </div>
  )
}
