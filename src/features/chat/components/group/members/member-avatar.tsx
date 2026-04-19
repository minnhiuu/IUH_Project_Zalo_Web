import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from '@/components/common/group-avatar'

interface MemberAvatarItem {
  avatar?: string | null
  name: string
}

interface MemberAvatarProps {
  members: MemberAvatarItem[]
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const singleSizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

export function MemberAvatar({ members, size = 'md', className }: MemberAvatarProps) {
  if (!members.length) return null

  if (members.length === 1) {
    const member = members[0]
    return (
      <UserAvatar
        src={member.avatar}
        name={member.name}
        className={`${singleSizeClasses[size]} ${className || ''}`.trim()}
      />
    )
  }

  return (
    <GroupAvatar
      avatars={members.map((m) => m.avatar)}
      names={members.map((m) => m.name)}
      count={members.length}
      size={size}
      className={className}
    />
  )
}
