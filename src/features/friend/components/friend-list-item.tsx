import { UserAvatar } from '@/components/common/user-avatar'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useFriendText } from '../i18n/use-friend-text'
import type { FriendResponse } from '../schemas/friend.schema'

interface FriendListItemProps {
  friend: FriendResponse
  onMessage?: (friend: FriendResponse) => void
  onViewProfile?: (friend: FriendResponse) => void
  onUnfriend?: (friend: FriendResponse) => void
}

export function FriendListItem({ friend, onMessage, onViewProfile, onUnfriend }: FriendListItemProps) {
  const { text } = useFriendText()

  return (
    <div className='flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group cursor-pointer'>
      <UserAvatar
        src={friend.userAvatar}
        name={friend.userName}
        className='w-12 h-12 shrink-0'
      />
      
      <div className='flex-1 min-w-0'>
        <h4 className='text-[15px] font-medium text-foreground truncate'>
          {friend.userName}
        </h4>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 hover:bg-muted',
              'focus:opacity-100 focus:outline-none'
            )}
          >
            <MoreHorizontal className='w-5 h-5 text-muted-foreground' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem onClick={() => onViewProfile?.(friend)}>
            {text.menu.viewProfile}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onMessage?.(friend)}>
            {text.actions.message}
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => onUnfriend?.(friend)}
          >
            {text.actions.unfriend}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
