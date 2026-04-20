import { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft, ArrowUp, Loader2, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router'
import { PostCard, PostComposerLauncher, useInfiniteMyPosts } from '@/features/social-feed'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { OwnerProfileDialog } from '@/features/user'
import { PATHS } from '@/constants/path'

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

export default function MyProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMyPosts(20)
  const posts = useMemo(() => data?.pages.flat() ?? [], [data])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 800)
  }

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { ref, inView } = useInView({ rootMargin: '400px' })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <section
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className='custom-scrollbar flex h-[100dvh] w-full flex-col overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/50'
    >
      {/* Header bar */}
      <header className='sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/80'>
        <Button variant='ghost' size='icon' className='shrink-0' onClick={() => navigate(PATHS.SOCIAL_FEED)}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h1 className='text-lg font-bold text-foreground'>My Profile</h1>
      </header>

      {/* Profile cover + info */}
      <div className='relative w-full'>
        {/* Cover image */}
        <div className='h-48 w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 md:h-56 lg:h-64'>
          {user?.background && (
            <img
              src={user.background}
              alt='Cover'
              className='h-full w-full object-cover'
              style={user.backgroundY != null ? { objectPosition: `center ${user.backgroundY}%` } : undefined}
            />
          )}
        </div>

        {/* Profile info overlay */}
        <div className='mx-auto -mt-14 max-w-3xl px-4 md:px-8'>
          <div className='flex items-end gap-4'>
            {/* Avatar */}
            <div className='relative shrink-0'>
              <div className='h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg dark:border-zinc-900'>
                <UserAvatar
                  src={user?.avatar}
                  name={user?.fullName || 'User'}
                  className='h-full w-full'
                  fallbackClassName='text-3xl font-bold'
                />
              </div>
            </div>

            {/* Name + bio */}
            <div className='flex-1 pb-2'>
              <h2 className='text-xl font-bold text-foreground md:text-2xl'>{user?.fullName}</h2>
              {user?.bio && <p className='mt-0.5 text-sm text-muted-foreground'>{user.bio}</p>}
            </div>

            {/* Edit profile button */}
            <Button
              variant='outline'
              size='sm'
              className='mb-2 shrink-0 gap-1.5'
              onClick={() => setShowProfileDialog(true)}
            >
              <Pencil className='h-3.5 w-3.5' />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Posts section */}
      <div className='mx-auto mt-6 w-full max-w-3xl px-4 pb-10 md:px-8'>
        {/* Post composer */}
        <div className='mb-6'>
          <PostComposerLauncher />
        </div>

        {/* Posts heading */}
        <div className='mb-4 flex items-center gap-2'>
          <h3 className='text-base font-semibold text-foreground'>Posts</h3>
          {!isLoading && <span className='text-sm text-muted-foreground'>({posts.length})</span>}
        </div>

        {/* Post list */}
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
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              <div ref={ref} className='flex justify-center py-6 text-zinc-500 dark:text-zinc-400'>
                {isFetchingNextPage && (
                  <div className='flex items-center gap-2 text-[14px] font-medium'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Loading...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-5 py-14 text-center dark:border-white/10 dark:bg-zinc-950/50'>
              <p className='text-[15px] font-medium text-zinc-500 dark:text-zinc-400'>No posts yet</p>
              <p className='mt-1 text-[13px] text-zinc-400 dark:text-zinc-500'>Share your first post to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating scroll-to-top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className='pointer-events-auto fixed bottom-[6rem] right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-indigo-600 hover:shadow-2xl active:scale-95 md:right-8'
          aria-label='Scroll to top'
        >
          <ArrowUp className='h-5 w-5' />
        </button>
      )}

      <OwnerProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />
    </section>
  )
}
