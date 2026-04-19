import { KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'

interface MessageSenderAvatarProps {
  src?: string | null
  name: string
  isGroup?: boolean
  isAdminOrOwner?: boolean
  isOwner?: boolean
  onClick?: () => void
  className?: string
}

export function MessageSenderAvatar({
  src,
  name,
  isGroup,
  isAdminOrOwner,
  isOwner,
  onClick,
  className
}: MessageSenderAvatarProps) {
  return (
    <div className={cn('relative', onClick && 'cursor-pointer')} onClick={onClick}>
      <UserAvatar src={src} name={name} className={cn('w-10 h-10 border border-black/5', className)} />
      {isGroup && isAdminOrOwner && (
        <span className='member-role-key-badge absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-background z-10'>
          <KeyRound
            strokeWidth={2.75}
            className={isOwner ? 'member-role-key-icon-owner w-2.5 h-2.5' : 'member-role-key-icon-admin w-2.5 h-2.5'}
          />
        </span>
      )}
    </div>
  )
}
