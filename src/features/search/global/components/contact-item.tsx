import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from '@/components/common/group-avatar'
import { cn } from '@/lib/utils'

interface ContactItemProps {
  name: string
  displayHighlights: string | null
  avatar?: string
  isGroup?: boolean
  participantNames?: string[] | null
  participantAvatars?: (string | null)[] | null
  onClick?: () => void
}

export function ContactItem({
  name,
  displayHighlights,
  avatar,
  isGroup,
  participantNames,
  participantAvatars,
  onClick
}: ContactItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors group relative',
        'hover:bg-muted/40'
      )}
    >
      {isGroup && !avatar ? (
        <GroupAvatar
          avatars={participantAvatars || []}
          names={participantNames || []}
          count={participantNames?.length || 0}
          size='lg'
          className='shrink-0'
        />
      ) : (
        <UserAvatar name={name} src={avatar} className='w-12 h-12 shrink-0' />
      )}
      <div className='flex flex-col min-w-0'>
        {displayHighlights ? (
          <span
            className='text-[15px] font-medium text-text-primary truncate [&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold'
            dangerouslySetInnerHTML={{ __html: displayHighlights }}
          />
        ) : (
          <span className='text-[15px] font-medium text-text-primary truncate'>{name}</span>
        )}
      </div>
    </div>
  )
}
