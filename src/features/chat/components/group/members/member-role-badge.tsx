import { KeyRound } from 'lucide-react'
import { GroupMemberRole } from '@/constants/enum'

interface MemberRoleBadgeProps {
  role?: string | null
  className?: string
}

export function MemberRoleBadge({ role, className }: MemberRoleBadgeProps) {
  if (role !== GroupMemberRole.Owner && role !== GroupMemberRole.Admin) return null

  return (
    <span
      className={`member-role-key-badge absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full flex items-center justify-center ${className}`}
    >
      <KeyRound
        strokeWidth={2.75}
        className={
          role === GroupMemberRole.Owner
            ? 'member-role-key-icon-owner w-2.5 h-2.5'
            : 'member-role-key-icon-admin w-2.5 h-2.5'
        }
      />
    </span>
  )
}
