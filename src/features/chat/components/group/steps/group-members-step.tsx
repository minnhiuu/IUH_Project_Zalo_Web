import { UserPlus, UserRoundPlus, UserRoundX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupMembersSection } from '../members/group-members-section'
import { JoinRequestsSection } from '../members/join-requests-section'
import { GroupMemberRole } from '@/constants/enum'
import type { GroupMemberListItemResponse } from '../../../schemas/chat.schema'
import { useJoinRequestsQuery } from '../../../queries/use-queries'
import { useApproveJoinRequestMutation, useRejectJoinRequestMutation } from '../../../queries/use-mutations'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { useChatText } from '../../../i18n/use-chat-text'

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
  onGoToAdmins?: () => void
  onGoToBlocked?: () => void
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
  onMemberClick,
  onGoToAdmins,
  onGoToBlocked
}: GroupMembersStepProps) {
  const { text } = useChatText()
  const tg = text['group-info-dialog']
  const isAdmin = currentUserRole === GroupMemberRole.Owner || currentUserRole === GroupMemberRole.Admin
  const isOwner = currentUserRole === GroupMemberRole.Owner
  const { data: joinRequests = [] } = useJoinRequestsQuery(conversationId, isAdmin)
  const { mutate: approveRequest } = useApproveJoinRequestMutation()
  const { mutate: rejectRequest } = useRejectJoinRequestMutation()

  return (
    <div className='flex flex-col h-full bg-background'>
      <div className='p-4 border-b border-border/50 flex flex-col gap-2'>
        <Button variant='secondary' className='w-full h-10 text-[14px] font-semibold' onClick={onOpenAddMember}>
          <UserPlus className='w-4 h-4 mr-2' />
          {addMemberLabel}
        </Button>

        <div className='flex flex-col'>
          {isOwner && (
            <ActionMenuItem
              icon={<UserRoundPlus className='w-4 h-4' />}
              label={tg.actions.ownerAndDeputy}
              showDivider={isAdmin}
              onClick={onGoToAdmins}
              className='px-0 py-2.5 h-auto'
            />
          )}
          {isAdmin && (
            <ActionMenuItem
              icon={<UserRoundX className='w-4 h-4' />}
              label={tg.actions.removeMembers}
              showDivider={false}
              onClick={onGoToBlocked}
              className='px-0 py-2.5 h-auto'
            />
          )}
        </div>
      </div>

      <div className='flex-1 overflow-hidden flex flex-col'>
        {isAdmin && joinRequests.length > 0 && (
          <JoinRequestsSection
            requests={joinRequests.map((r) => ({
              id: r.id,
              userId: r.userId,
              fullName: r.fullName,
              avatar: r.avatar ?? '',
              joinAnswer: r.joinAnswer
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
