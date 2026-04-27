import { UserAvatar } from '@/components/common/user-avatar'

interface ContactItemProps {
  name: string
  displayHighlights: string | null
  avatar?: string
  onClick?: () => void
}

export function ContactItem({
  name,
  displayHighlights,
  avatar,
  onClick
}: ContactItemProps) {
  return (
    <div
      onClick={onClick}
      className='flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 cursor-pointer transition-colors group'
    >
      <UserAvatar name={name} src={avatar} className='w-12 h-12 shrink-0' />
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
