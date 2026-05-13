import { UserAvatar } from '@/components/common/user-avatar'
import { Search, MoreHorizontal, UserPlus } from 'lucide-react'
import { useUnifiedSuggestions } from '@/features/friend/queries'
import { useNavigate } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function SuggestedFriendsSidebar() {
  const navigate = useNavigate()
  const { data, isLoading } = useUnifiedSuggestions(0, 10)
  
  // Extract friends from the page response (data.data.content or just data.content depending on api structure)
  // useUnifiedSuggestions uses friendOptions.unifiedSuggestions which returns data.data (the PageResponse)
  const suggestions = data?.content || []

  return (
    <aside className='hidden w-[280px] shrink-0 lg:block 2xl:w-[360px] pr-2'>
      <div className='sticky top-0 pb-10'>
        <div className='flex items-center justify-between px-2 py-2 mb-2'>
          <h3 className='text-[16px] font-semibold text-zinc-500 dark:text-[#b0b3b8]'>Gợi ý kết bạn</h3>
          <div className='flex items-center gap-1 text-zinc-500 dark:text-[#b0b3b8]'>
            <button className='flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors'>
              <Search className='h-4 w-4' />
            </button>
            <button className='flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors'>
              <MoreHorizontal className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='grid gap-1'>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3 p-2'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <Skeleton className='h-4 flex-1' />
              </div>
            ))
          ) : suggestions.length > 0 ? (
            suggestions.map((friend) => (
              <div
                key={friend.userId}
                onClick={() => navigate(`/profile/${friend.userId}`)}
                className='group flex cursor-pointer items-center justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='relative h-9 w-9 shrink-0'>
                    <UserAvatar
                      name={friend.fullName}
                      src={friend.avatar}
                      className='w-full h-full border border-background'
                      fallbackClassName='bg-primary text-xs'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <span className='block truncate text-[15px] font-medium text-zinc-700 dark:text-[#ececec]'>
                      {friend.fullName}
                    </span>
                    {(friend.mutualFriendsCount ?? 0) > 0 && (
                      <span className='block truncate text-[12px] text-zinc-500 dark:text-[#b0b3b8]'>
                        {friend.mutualFriendsCount} bạn chung
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100 dark:hover:bg-zinc-800'
                  onClick={(e) => {
                    e.stopPropagation()
                    // navigate or add friend logic
                  }}
                >
                  <UserPlus className='h-4 w-4' />
                </Button>
              </div>
            ))
          ) : (
            <div className='px-2 py-4 text-center text-[14px] text-zinc-500 dark:text-[#b0b3b8]'>
              Không có gợi ý nào
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
