import { UserAvatar } from '@/components/common/user-avatar'
import { Search, MoreHorizontal } from 'lucide-react'

const SUGGESTED_FRIENDS = [
  { id: 1, name: 'Hoàng Huy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huy', online: true },
  { id: 2, name: 'Minh Tuấn', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan', online: true },
  { id: 3, name: 'Thanh Hà', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ha', online: false },
  { id: 4, name: 'Xuân Hồ', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Xuan', online: true },
  { id: 5, name: 'Trần Ngọc Huyền', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huyen', online: true },
  { id: 6, name: 'Nguyễn Thúy Hiền', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hien', online: true }
]

export function SuggestedFriendsSidebar() {

  return (
    <aside className='hidden w-[280px] shrink-0 lg:block 2xl:w-[360px] pr-2'>
      <div className='sticky top-0 pb-10'>
        <div className='flex items-center justify-between px-2 py-2'>
          <h3 className='text-[15px] font-semibold text-zinc-500 dark:text-[#b0b3b8]'>Người liên hệ</h3>
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
          {SUGGESTED_FRIENDS.map((friend) => (
            <div
              key={friend.id}
              className='group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
            >
              <div className='relative h-9 w-9'>
                <UserAvatar
                  name={friend.name}
                  src={friend.avatar}
                  className='w-full h-full border border-background'
                  fallbackClassName='bg-primary text-xs'
                />
                {friend.online && (
                  <span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-[#18191a]' />
                )}
              </div>
              <span className='text-[15px] font-medium text-zinc-700 dark:text-[#ececec]'>
                {friend.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
