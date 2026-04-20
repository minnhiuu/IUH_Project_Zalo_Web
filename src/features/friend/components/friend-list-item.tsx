import { UserAvatar } from '@/components/common/user-avatar'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
    <div
      onClick={() => onMessage?.(friend)}
      className='flex items-center gap-3 px-2 py-2 hover:bg-muted/40 transition-colors group cursor-pointer rounded-md'
    >
      <UserAvatar src={friend.userAvatar} name={friend.userName} className='w-10 h-10 shrink-0' />

      <div className='flex-1 min-w-0'>
        <h4 className='text-sm font-semibold text-text-primary truncate'>{friend.userName}</h4>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 hover:bg-muted/60',
              'focus:opacity-100 focus:outline-none'
            )}
          >
            <MoreHorizontal className='w-4 h-4 text-text-secondary' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48' onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onViewProfile?.(friend)
            }}
          >
            {text.menu.viewProfile}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onMessage?.(friend)
            }}
          >
            {text.actions.message}
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={(e) => {
              e.stopPropagation()
              onUnfriend?.(friend)
            }}
          >
            {text.actions.unfriend}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
