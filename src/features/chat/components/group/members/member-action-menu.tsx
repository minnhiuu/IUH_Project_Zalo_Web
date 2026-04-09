import { Ellipsis } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { GroupMemberRole } from '@/constants/enum'
import type { GroupMemberListItemResponse } from '../../../schemas/chat.schema'

type MemberMenuAction = 'leave' | 'add-deputy' | 'remove-deputy' | 'remove-member'

interface MemberActionMenuProps {
  member: GroupMemberListItemResponse
  currentUserRole: GroupMemberRole
  labels: {
    leaveGroup: string
    addDeputy: string
    removeDeputy: string
    removeFromGroup: string
  }
  onAction: (action: MemberMenuAction, member: GroupMemberListItemResponse) => void
  onOpenChange?: (open: boolean) => void
}

function canShowActionMenu(member: GroupMemberListItemResponse, currentUserRole: GroupMemberRole) {
  if (member.isCurrentUser) return true
  if (currentUserRole === GroupMemberRole.Member) return false
  if (currentUserRole === GroupMemberRole.Admin && member.role === GroupMemberRole.Owner) return false
  return true
}

export function MemberActionMenu({ member, currentUserRole, labels, onAction, onOpenChange }: MemberActionMenuProps) {
  if (!canShowActionMenu(member, currentUserRole)) return null

  const isTargetAdmin = member.role?.toUpperCase() === GroupMemberRole.Admin

  return (
    <DropdownMenu modal={false} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 text-muted-foreground hover:text-foreground'
          onClick={(e) => e.stopPropagation()}
        >
          <Ellipsis className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={6} className='w-52 z-140'>
        {member.isCurrentUser ? (
          <DropdownMenuItem
            className='cursor-pointer min-h-10 px-3 py-2 text-sm'
            onSelect={() => onAction('leave', member)}
          >
            {labels.leaveGroup}
          </DropdownMenuItem>
        ) : currentUserRole === GroupMemberRole.Owner ? (
          <>
            {isTargetAdmin ? (
              <DropdownMenuItem
                className='cursor-pointer min-h-10 px-3 py-2 text-sm'
                onSelect={() => onAction('remove-deputy', member)}
              >
                {labels.removeDeputy}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className='cursor-pointer min-h-10 px-3 py-2 text-sm'
                onSelect={() => onAction('add-deputy', member)}
              >
                {labels.addDeputy}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className='cursor-pointer min-h-10 px-3 py-2 text-sm'
              onSelect={() => onAction('remove-member', member)}
            >
              {labels.removeFromGroup}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            className='cursor-pointer min-h-10 px-3 py-2 text-sm'
            onSelect={() => onAction('remove-member', member)}
          >
            {labels.removeFromGroup}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
