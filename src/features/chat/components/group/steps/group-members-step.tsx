import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupMembersSection } from '../members/group-members-section'
import type { GroupMemberRole } from '@/constants/enum'

interface GroupMembersStepProps {
  conversationId: string
  membersTitle: string
  membersCount: number
  addMemberLabel: string
  addFriendLabel: string
  currentUserRole: GroupMemberRole
  onOpenAddMember: () => void
  onLeaveGroup: () => void
}

export function GroupMembersStep({
  conversationId,
  membersTitle,
  membersCount,
  addMemberLabel,
  addFriendLabel,
  currentUserRole,
  onOpenAddMember,
  onLeaveGroup
}: GroupMembersStepProps) {
  return (
    <div className='flex flex-col h-full bg-background'>
      <div className='p-4 border-b border-border/50'>
        <Button variant='secondary' className='w-full h-10 text-[14px] font-semibold' onClick={onOpenAddMember}>
          <UserPlus className='w-4 h-4 mr-2' />
          {addMemberLabel}
        </Button>
      </div>

      <div className='flex-1 overflow-hidden'>
        <GroupMembersSection
          conversationId={conversationId}
          title={membersTitle}
          membersCount={membersCount}
          addFriendLabel={addFriendLabel}
          currentUserRole={currentUserRole}
          onLeaveGroup={onLeaveGroup}
        />
      </div>
    </div>
  )
}
