import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupMembersSection } from '../members/group-members-section'
import { JoinRequestsSection } from '../members/join-requests-section'
import { GroupMemberRole } from '@/constants/enum'
import type { GroupMemberListItemResponse } from '../../../schemas/chat.schema'
import { useJoinRequestsQuery } from '../../../queries/use-queries'
import { useApproveJoinRequestMutation, useRejectJoinRequestMutation } from '../../../queries/use-mutations'

interface GroupMembersStepProps {
  conversationId: string
  membersTitle: string
  membersCount: number
  addMemberLabel: string
  addFriendLabel: string
  currentUserRole: GroupMemberRole
  onOpenAddMember: () => void
  onLeaveGroup: () => void
  onMemberClick?: (member: GroupMemberListItemResponse) => void
}

export function GroupMembersStep({
  conversationId,
  membersTitle,
  membersCount,
  addMemberLabel,
  addFriendLabel,
  currentUserRole,
  onOpenAddMember,
  onLeaveGroup,
  onMemberClick
}: GroupMembersStepProps) {
  const isAdmin = currentUserRole === GroupMemberRole.Owner || currentUserRole === GroupMemberRole.Admin
  const { data: joinRequests = [] } = useJoinRequestsQuery(conversationId, isAdmin)
  const { mutate: approveRequest } = useApproveJoinRequestMutation()
  const { mutate: rejectRequest } = useRejectJoinRequestMutation()

  return (
    <div className='flex flex-col h-full bg-background'>
      <div className='p-4 border-b border-border/50'>
        <Button variant='secondary' className='w-full h-10 text-[14px] font-semibold' onClick={onOpenAddMember}>
          <UserPlus className='w-4 h-4 mr-2' />
          {addMemberLabel}
        </Button>
      </div>

      <div className='flex-1 overflow-hidden flex flex-col'>
        {isAdmin && joinRequests.length > 0 && (
          <JoinRequestsSection
            requests={joinRequests.map((r) => ({
              id: r.id,
              userId: r.userId,
              fullName: r.fullName,
              avatar: r.avatar ?? ''
            }))}
            onAccept={(req) => approveRequest({ conversationId, requestId: req.id })}
            onReject={(req) => rejectRequest({ conversationId, requestId: req.id })}
          />
        )}

        <div className='flex-1 min-h-0'>
          <GroupMembersSection
            conversationId={conversationId}
            title={membersTitle}
            membersCount={membersCount}
            addFriendLabel={addFriendLabel}
            currentUserRole={currentUserRole}
            onLeaveGroup={onLeaveGroup}
            onMemberClick={onMemberClick}
          />
        </div>
      </div>
    </div>
  )
}
