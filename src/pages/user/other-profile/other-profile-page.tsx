import { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft, ArrowUp, Loader2, MessageCircle, UserPlus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { PostCard, useInfiniteUserPosts } from '@/features/social-feed'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/user-avatar'
import { useUserById } from '@/features/user'
import { OthersProfileDialog } from '@/features/user'
import { ProfileInfoCard } from '@/features/user/components/profile-page/profile-info-card'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { PATHS } from '@/constants/path'
import { useAuthContext } from '@/features/auth/context/auth-context'

function PostCardSkeleton() {
  return (
    <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#242526]'>
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
      <Skeleton className='mt-4 h-56 w-full rounded-xl' />
    </div>
  )
}

export default function OtherProfilePage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const { user: me } = useAuthContext()
  const { text } = useUserText()
  const p = text.profile.page
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  const { data: profileUser, isLoading: isUserLoading } = useUserById(userId ?? '')
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteUserPosts(userId ?? '', 20)
  const posts = useMemo(() => data?.pages.flat() ?? [], [data])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 600)
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

  // Redirect to own profile page if the userId matches the current user
  useEffect(() => {
    if (me?.id && userId && me.id === userId) {
      navigate(PATHS.USER.PROFILE, { replace: true })
    }
  }, [me?.id, userId, navigate])

  const isMe = me?.id === userId

  return (
    <section
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className='custom-scrollbar flex h-[100dvh] w-full flex-col overflow-y-auto bg-[#f0f2f5] dark:bg-[#18191a]'
    >
      {/* ── Back header ── */}
      <header className='sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200/60 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#242526]/90'>
        <Button variant='ghost' size='icon' className='shrink-0' onClick={() => navigate(-1)}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        {isUserLoading ? (
          <Skeleton className='h-5 w-40' />
        ) : (
          <h1 className='truncate text-[17px] font-bold text-foreground'>
            {profileUser?.fullName ?? 'Profile'}
          </h1>
        )}
      </header>

      {/* ── Cover photo ── */}
      <div className='relative w-full bg-zinc-300 dark:bg-zinc-800'>
        <div className='mx-auto max-w-5xl'>
          <div className='relative h-52 w-full overflow-hidden rounded-b-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 md:h-64 lg:h-[340px]'>
            {isUserLoading ? (
              <Skeleton className='h-full w-full rounded-none' />
            ) : profileUser?.background ? (
              <img
                src={profileUser.background}
                alt='Cover'
                className='h-full w-full object-cover'
                style={
                  profileUser.backgroundY != null
                    ? { objectPosition: `center ${profileUser.backgroundY}%` }
                    : undefined
                }
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Identity row ── */}
      <div className='border-b border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-[#242526]'>
        <div className='mx-auto max-w-5xl px-4 pb-0 md:px-6'>
          {/* Avatar + name + actions */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex items-end gap-4'>
              {/* Avatar — overlaps cover */}
              <div className='-mt-10 shrink-0 md:-mt-14'>
                <div className='h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-white bg-white shadow-lg dark:border-[#242526] md:h-[148px] md:w-[148px]'>
                  {isUserLoading ? (
                    <Skeleton className='h-full w-full rounded-full' />
                  ) : (
                    <UserAvatar
                      src={profileUser?.avatar}
                      name={profileUser?.fullName || 'User'}
                      className='h-full w-full'
                      fallbackClassName='text-4xl font-bold bg-primary'
                    />
                  )}
                </div>
              </div>

              {/* Name + bio */}
              <div className='mb-2 min-w-0 flex-1 pb-1'>
                {isUserLoading ? (
                  <div className='space-y-2'>
                    <Skeleton className='h-7 w-44' />
                    <Skeleton className='h-4 w-64' />
                  </div>
                ) : (
                  <>
                    <h2 className='truncate text-[22px] font-bold text-foreground md:text-[28px]'>
                      {profileUser?.fullName}
                    </h2>
                    {profileUser?.bio && (
                      <p className='mt-0.5 truncate text-[14px] text-muted-foreground'>
                        {profileUser.bio}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {!isMe && !isUserLoading && profileUser && (
              <div className='mb-3 flex shrink-0 items-center gap-2 sm:mb-4'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-9 gap-1.5 rounded-lg px-4 font-semibold'
                  onClick={() => setShowProfileDialog(true)}
                >
                  <UserPlus className='h-4 w-4' />
                  {p.addFriend}
                </Button>
                <Button
                  size='sm'
                  className='h-9 gap-1.5 rounded-lg bg-indigo-500 px-4 font-semibold text-white hover:bg-indigo-600'
                  onClick={() => { window.location.href = `/chat/u/${userId}` }}
                >
                  <MessageCircle className='h-4 w-4' />
                  {p.message}
                </Button>
              </div>
            )}
          </div>

          {/* Divider + Tab nav */}
          <div className='mt-1 border-t border-zinc-200 dark:border-white/[0.08]'>
            <nav className='-mb-px flex gap-1 overflow-x-auto'>
              {['Tất cả', 'Giới thiệu', 'Bạn bè', 'Ảnh', 'Reels'].map((tab, i) => (
                <button
                  key={tab}
                  className={`whitespace-nowrap px-4 py-3 text-[15px] font-semibold transition-colors ${
                    i === 0
                      ? 'border-b-[3px] border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className='mx-auto w-full max-w-5xl px-4 py-5 md:px-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start'>

          {/* ── LEFT sidebar ── */}
          <div className='w-full shrink-0 space-y-4 lg:w-[360px] lg:sticky lg:top-[57px]'>
            {isUserLoading ? (
              <div className='space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#242526]'>
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-4/5' />
                <Skeleton className='h-4 w-3/5' />
              </div>
            ) : profileUser ? (
              <ProfileInfoCard user={profileUser} isOther={true} />
            ) : null}
          </div>

          {/* ── RIGHT posts column ── */}
          <div className='min-w-0 flex-1 space-y-4'>
            {/* Posts heading */}
            <div className='flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#242526]'>
              <h3 className='text-[17px] font-bold text-foreground'>{p.postsHeading}</h3>
              {!isLoading && (
                <span className='text-[14px] text-muted-foreground'>({posts.length})</span>
              )}
            </div>

            {/* Post list */}
            <div className='flex flex-col space-y-4'>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
              ) : isError ? (
                <div className='rounded-2xl border border-dashed border-red-300 bg-red-50/70 px-5 py-10 text-center text-[14px] font-medium text-red-700 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300'>
                  <p className='mb-4'>{p.loadError}</p>
                  <Button variant='outline' onClick={() => refetch()}>
                    {p.retry}
                  </Button>
                </div>
              ) : posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  <div ref={ref} className='flex justify-center py-4 text-zinc-500 dark:text-zinc-400'>
                    {isFetchingNextPage && (
                      <div className='flex items-center gap-2 text-[14px] font-medium'>
                        <Loader2 className='h-4 w-4 animate-spin' /> {p.loadingMore}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className='rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center dark:border-white/10 dark:bg-[#242526]'>
                  <p className='text-[15px] font-medium text-zinc-500 dark:text-zinc-400'>{p.noPostsOther}</p>
                  <p className='mt-1 text-[13px] text-zinc-400 dark:text-zinc-500'>{p.noPostsOtherHint}</p>
                </div>
              )}
            </div>
          </div>
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

      {/* Full profile dialog (Add Friend / Block / etc.) */}
      <OthersProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        userId={userId}
      />
    </section>
  )
}
