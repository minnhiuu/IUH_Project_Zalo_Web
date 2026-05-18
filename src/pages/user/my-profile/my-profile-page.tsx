import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft, ArrowUp, Loader2, Pencil, Search, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router'
import { PostCard, PostComposerLauncher, useInfiniteMyPosts } from '@/features/social-feed'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar, getInitials, getNameColor } from '@/components/common/user-avatar'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { OwnerProfileDialog, useMyProfile } from '@/features/user'
import { ProfileInfoCard } from '@/features/user/components/profile-page/profile-info-card'
import { ProfileReelsGrid } from '@/features/user/components/profile-page/profile-reels-grid'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { PATHS } from '@/constants/path'
import { useMyFriends } from '@/features/friend/queries'
import { useUsersByIds } from '@/features/user/queries/use-queries'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StoryViewerModal } from '@/features/social-feed/components/stories/story-viewer-modal'
import { mapPostToSocialStory } from '@/features/social-feed/queries/options'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

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

export default function MyProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { data: fullProfile } = useMyProfile()
  const { text } = useUserText()
  const p = text.profile.page
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  
  const [isViewingAvatar, setIsViewingAvatar] = useState(false)
  const [isViewingStory, setIsViewingStory] = useState(false)

  const { data: friends } = useMyFriends()
  const safeFriends = useMemo(() => (Array.isArray(friends) ? friends : []), [friends])

  const friendIds = useMemo(() => safeFriends.map((f) => f.userId), [safeFriends])
  const { data: userSummaryMap } = useUsersByIds(friendIds)

  const friendsWithInfo = useMemo(() => {
    return safeFriends.map((friend) => {
      const info = userSummaryMap?.[friend.userId]
      return {
        ...friend,
        userName: info?.fullName || friend.userName,
        userAvatar: info?.avatar || friend.userAvatar
      }
    })
  }, [safeFriends, userSummaryMap])

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMyPosts(20)
  const posts = useMemo(() => data?.pages.flat() ?? [], [data])

  const [activeTab, setActiveTab] = useState('Tất cả')
  const displayedPosts = useMemo(() => {
    if (activeTab === 'Reels') return posts.filter((p) => p.postType === 'REEL')
    if (activeTab === 'Ảnh') return posts.filter((p) => p.media?.some((m) => m.type === 'IMAGE'))
    if (activeTab === 'Giới thiệu' || activeTab === 'Bạn bè') return [] // Placeholder for other tabs
    return posts
  }, [posts, activeTab])

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

  return (
    <section
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className='custom-scrollbar flex h-[100dvh] w-full flex-col overflow-y-auto bg-[#f0f2f5] dark:bg-[#18191a]'
    >
      {/* ── Back header ── */}
      <header className='sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200/60 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#242526]/90'>
        <Button variant='ghost' size='icon' className='shrink-0' onClick={() => navigate(PATHS.SOCIAL_FEED)}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h1 className='text-[17px] font-bold text-foreground'>{p.myTitle}</h1>
      </header>

      {/* ── Cover photo ── */}
      <div className='relative w-full bg-zinc-300 dark:bg-zinc-800'>
        <div className='mx-auto max-w-5xl'>
          <div className='relative h-52 w-full overflow-hidden rounded-b-2xl bg-gradient-to-br from-primary via-blue-500 to-sky-400 md:h-64 lg:h-[340px]'>
            {user?.background && (
              <img
                src={user.background}
                alt='Cover'
                className='h-full w-full object-cover'
                style={user.backgroundY != null ? { objectPosition: `center ${user.backgroundY}%` } : undefined}
              />
            )}
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
              <div className='-mt-10 shrink-0 md:-mt-14 relative z-10'>
                <DropdownMenu>
                  <DropdownMenuTrigger className='rounded-full outline-none focus:outline-none'>
                    <div 
                      className={cn(
                        'rounded-full transition-all hover:opacity-90 flex items-center justify-center',
                        fullProfile?.story?.hasUnviewed 
                          ? 'bg-brand-blue p-[2px]' 
                          : (fullProfile?.story && fullProfile?.story?.stories?.length > 0)
                            ? 'bg-zinc-300 dark:bg-zinc-700 p-[2px]'
                            : 'bg-transparent p-0'
                      )}
                    >
                      <div className='h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-white bg-white shadow-lg dark:border-[#242526] md:h-[148px] md:w-[148px]'>
                        <UserAvatar
                          src={user?.avatar}
                          name={user?.fullName || 'User'}
                          className='h-full w-full'
                          fallbackClassName='text-4xl font-bold bg-primary'
                        />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-48'>
                    <DropdownMenuItem onClick={() => setIsViewingAvatar(true)} className='cursor-pointer'>
                      Xem ảnh đại diện
                    </DropdownMenuItem>
                    {fullProfile?.story && fullProfile.story.stories?.length > 0 && (
                      <DropdownMenuItem onClick={() => setIsViewingStory(true)} className='cursor-pointer'>
                        Xem story
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Name + bio */}
              <div className='mb-2 min-w-0 flex-1 pb-1'>
                <h2 className='truncate text-[22px] font-bold text-foreground md:text-[28px]'>
                  {user?.fullName}
                </h2>
                {user?.bio && (
                  <p className='mt-0.5 truncate text-[14px] text-muted-foreground'>{user.bio}</p>
                )}
              </div>
            </div>
            {/* Edit profile button */}
            <div className='mb-3 flex shrink-0 items-center gap-2 sm:mb-4'>
              <Button
                variant='outline'
                size='sm'
                className='h-9 gap-1.5 rounded-lg px-4 font-semibold'
                onClick={() => setShowProfileDialog(true)}
              >
                <Pencil className='h-4 w-4' />
                {p.editProfile}
              </Button>
            </div>
          </div>

          {/* Divider + Tab nav */}
          <div className='mt-1 border-t border-zinc-200 dark:border-white/[0.08]'>
            <nav className='-mb-px flex gap-1 overflow-x-auto'>
              {['Tất cả', 'Giới thiệu', 'Bạn bè', 'Ảnh', 'Reels'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-3 text-[15px] font-semibold transition-colors ${
                    activeTab === tab
                      ? 'border-b-[3px] border-primary text-primary dark:text-primary'
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
          {(activeTab === 'Tất cả' || activeTab === 'Giới thiệu') && (
            <div className='w-full shrink-0 space-y-4 lg:w-[360px] lg:sticky lg:top-[57px]'>
              {fullProfile ? (
                <ProfileInfoCard user={fullProfile} isOther={false} />
              ) : (
                <div className='space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#242526]'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-4/5' />
                  <Skeleton className='h-4 w-3/5' />
                </div>
              )}
            </div>
          )}

          {/* ── RIGHT posts column ── */}
          <div className='min-w-0 flex-1 space-y-4'>
            {/* Post composer */}
            {activeTab !== 'Bạn bè' && activeTab !== 'Giới thiệu' && activeTab !== 'Ảnh' && activeTab !== 'Reels' && (
              <PostComposerLauncher />
            )}

            {/* Posts heading */}
            {activeTab !== 'Bạn bè' && activeTab !== 'Giới thiệu' && (
              <div className='flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#242526]'>
                <h3 className='text-[17px] font-bold text-foreground'>
                  {activeTab === 'Tất cả' ? p.postsHeading : activeTab}
                </h3>
                {!isLoading && (
                  <span className='text-[14px] text-muted-foreground'>({displayedPosts.length})</span>
                )}
              </div>
            )}

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
              ) : activeTab === 'Bạn bè' ? (
                <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#242526]'>
                  <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <h3 className='text-[20px] font-bold text-foreground'>{p.friendsTab}</h3>
                    <div className='flex flex-wrap items-center gap-2'>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                        <input
                          type='text'
                          placeholder={p.searchPlaceholder}
                          className='h-9 w-full rounded-full bg-zinc-100 pl-9 pr-4 text-[14px] outline-none transition-colors focus:ring-2 focus:ring-primary dark:bg-white/10 dark:text-white dark:placeholder:text-zinc-400 sm:w-[200px]'
                        />
                      </div>
                      <Button variant='ghost' className='h-9 font-semibold text-primary hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/20'>
                        Tìm bạn bè
                      </Button>
                      <Button variant='secondary' size='icon' className='h-9 w-9 shrink-0 rounded-md bg-zinc-100 dark:bg-white/10 dark:hover:bg-white/20'>
                        <MoreHorizontal className='h-5 w-5' />
                      </Button>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    {friendsWithInfo.length > 0 ? (
                      friendsWithInfo.map((friend) => (
                        <div
                          key={friend.userId}
                          onClick={() => navigate(`/profile/${friend.userId}`)}
                          className='flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5'
                        >
                          <div className='flex items-center gap-4'>
                            <UserAvatar
                              src={friend.userAvatar}
                              name={friend.userName}
                              className='h-[80px] w-[80px] shrink-0 rounded-xl'
                            />
                            <div className='min-w-0 flex-1'>
                              <h4 className='truncate text-[16px] font-semibold text-foreground'>{friend.userName}</h4>
                              {friend.mutualFriendsCount > 0 && (
                                <p className='text-[13px] text-zinc-500 dark:text-zinc-400'>{p.mutualFriends(friend.mutualFriendsCount)}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-zinc-500 dark:text-zinc-400 dark:hover:bg-white/10'
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <MoreHorizontal className='h-5 w-5' />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className='col-span-full py-10 text-center'>
                        <p className='text-[15px] font-medium text-zinc-500 dark:text-zinc-400'>{p.noFriends}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'Giới thiệu' ? (
                <div className='rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center dark:border-white/10 dark:bg-[#242526]'>
                  <p className='text-[15px] font-medium text-zinc-500 dark:text-zinc-400'>{p.featureInDevelopment}</p>
                </div>
              ) : displayedPosts.length > 0 ? (
                <>
                  {activeTab === 'Reels' ? (
                    <ProfileReelsGrid reels={displayedPosts} />
                  ) : (
                    displayedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
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
                  <p className='text-[15px] font-medium text-zinc-500 dark:text-zinc-400'>{p.noPosts}</p>
                  <p className='mt-1 text-[13px] text-zinc-400 dark:text-zinc-500'>{p.noPostsHint}</p>
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
          className='pointer-events-auto fixed bottom-[6rem] right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/20 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-2xl active:scale-95 md:right-8'
          aria-label='Scroll to top'
        >
          <ArrowUp className='h-5 w-5' />
        </button>
      )}

      <OwnerProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />

      {/* Avatar Viewer Modal */}
      <Dialog open={isViewingAvatar} onOpenChange={setIsViewingAvatar}>
        <DialogContent className='max-w-[90vw] md:max-w-4xl max-h-[90vh] bg-transparent border-none shadow-none flex items-center justify-center' showCloseButton={false}>
          <DialogTitle className='sr-only'>Ảnh đại diện</DialogTitle>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt='Avatar'
              className='max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl'
            />
          ) : (
            <div 
              className='w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] rounded-full flex items-center justify-center text-white text-[100px] md:text-[150px] font-bold shadow-2xl'
              style={{ backgroundColor: getNameColor(user?.fullName || 'User') }}
            >
              {getInitials(user?.fullName || 'User')}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Story Viewer Modal */}
      {isViewingStory && fullProfile?.story && fullProfile.story.stories.length > 0 && (
        <StoryViewerModal
          open={isViewingStory}
          onOpenChange={setIsViewingStory}
          initialGroupIndex={0}
          groups={[
            {
              authorId: fullProfile.id || '',
              authorName: fullProfile.fullName || 'User',
              authorAvatar: fullProfile.avatar,
              stories: fullProfile.story.stories.map(mapPostToSocialStory)
            }
          ]}
        />
      )}
    </section>
  )
}
