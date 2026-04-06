import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/common/user-avatar'
import { X } from 'lucide-react'
import type { SearchMemberResponse } from '../../schemas/chat.schema'

interface SelectedMemberSidebarProps {
  selectedFriends: SearchMemberResponse[]
  onRemove: (userId: string) => void
  selectedCount: number
  totalLimit?: number
  title: string
}

export const SelectedMemberSidebar = ({
  selectedFriends,
  onRemove,
  selectedCount,
  totalLimit = 100,
  title
}: SelectedMemberSidebarProps) => {
  return (
    <div className='flex flex-col border rounded-[8px] h-full overflow-hidden bg-background'>
      <div className='p-2.5 py-1.5 flex items-center gap-1.5 whitespace-nowrap overflow-hidden shrink-0'>
        <span className='text-[11.5px] font-bold'>{title}</span>
        <span className='text-[10.5px] px-1.5 py-0.25 rounded-md bg-dialog-selection-badge-bg text-dialog-selection-badge-text'>
          {selectedCount}/{totalLimit}
        </span>
      </div>

      <ScrollArea className='flex-1'>
        <div className='p-1.5 space-y-1'>
          {selectedFriends.map((friend) => (
            <div
              key={friend.userId}
              className='flex items-center gap-2 p-1 px-2 rounded-full bg-dialog-selection-bg text-dialog-selection-text group transition-colors w-full overflow-hidden'
            >
              <UserAvatar name={friend.fullName} src={friend.avatar} className='w-6 h-6 shrink-0 shadow-sm' />
              <span className='flex-1 text-[12px] truncate font-medium'>{friend.fullName}</span>
              <button
                onClick={() => onRemove(friend.userId)}
                className='p-0 hover:bg-transparent rounded-full flex items-center justify-center shrink-0 ml-0.5 cursor-pointer transition-transform hover:scale-110 active:scale-95'
              >
                <div className='w-4.5 h-4.5 bg-icon-x-bg rounded-full flex items-center justify-center shadow-sm transition-colors'>
                  <X className='w-3 h-3 text-icon-x-text stroke-[3.5]' />
                </div>
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
