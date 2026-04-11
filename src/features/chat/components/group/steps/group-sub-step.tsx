import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GroupManagementStep } from './group-management-step'
import { GroupMembersStep } from './group-members-step'
import { CreateGroupDialog } from '../dialogs/create-group-dialog'
import { LeaveGroupDialog } from '../dialogs/leave-group-dialog'
import { TransferOwnerDialog } from '../dialogs/transfer-owner-dialog'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { useChatText } from '../../../i18n/use-chat-text'
import { useAuth } from '@/features/auth'
import { GroupMemberRole } from '@/constants/enum'
import { OwnerProfileDialog } from '@/features/user/components/profile-dialog/owner/owner-profile-dialog'
import { OthersProfileDialog } from '@/features/user/components/profile-dialog/others/others-profile-dialog'

import { GroupAdminsStep } from './group-admins-step'
import { GroupBlockedStep } from './group-blocked-step'

interface GroupSubStepProps {
  conversation: ConversationResponse
  currentUserRole: GroupMemberRole
  step: 'management' | 'members' | 'admins' | 'blocked'
  onBack: () => void
  onStepChange: (step: 'management' | 'members' | 'admins' | 'blocked') => void
}

export function GroupSubStep({ conversation, currentUserRole, step, onBack, onStepChange }: GroupSubStepProps) {
  const { text: tg } = useChatText()
  const { user } = useAuth()

  const isOwner = currentUserRole === GroupMemberRole.Owner

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false)
  const [isTransferOwnerDialogOpen, setIsTransferOwnerDialogOpen] = useState(false)
  const [pendingTransferTargetId, setPendingTransferTargetId] = useState<string | null>(null)
  const [isOwnerProfileOpen, setIsOwnerProfileOpen] = useState(false)
  const [isOthersProfileOpen, setIsOthersProfileOpen] = useState(false)
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | undefined>(undefined)

  const handleLeaveGroup = () => {
    if (isOwner) {
      setIsTransferOwnerDialogOpen(true)
    } else {
      setIsLeaveGroupDialogOpen(true)
    }
  }

  const getTitle = () => {
    if (step === 'management') return tg['group-info-dialog'].managementTitle
    if (step === 'admins') return tg['group-info-dialog'].actions.ownerAndDeputy
    if (step === 'blocked') return tg['group-info-dialog'].actions.removeMembers
    return tg.sidebarInfo.members
  }

  return (
    <div
      className={cn(
        'chat-info-sidebar w-87.5 border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0 shadow-xl min-[1150px]:shadow-none'
      )}
    >
      <div className='h-17 flex items-center border-b border-border shrink-0 px-4'>
        <button
          onClick={onBack}
          className='p-1 -ml-1 hover:bg-muted rounded-full transition-colors outline-none cursor-pointer shrink-0'
        >
          <ArrowLeft className='w-5 h-5 text-foreground' />
        </button>
        <h2 className='font-bold text-[16px] text-foreground flex-1 text-center pr-6 truncate'>{getTitle()}</h2>
      </div>

      <div className='flex-1 overflow-hidden'>
        {step === 'management' ? (
          <GroupManagementStep
            text={tg['group-info-dialog']}
            conversationId={conversation.id}
            currentUserRole={currentUserRole}
            settings={conversation.settings}
            joinLinkToken={conversation.joinLinkToken}
            memberCount={conversation.members?.length || 0}
            pendingJoinRequestCount={conversation.pendingJoinRequestCount}
            onDisbandSuccess={onBack}
            onGoToAdmins={() => onStepChange('admins')}
            onGoToBlocked={() => onStepChange('blocked')}
          />
        ) : step === 'admins' ? (
          <GroupAdminsStep conversation={conversation} currentUserRole={currentUserRole} />
        ) : step === 'blocked' ? (
          <GroupBlockedStep currentUserRole={currentUserRole} conversationId={conversation.id} />
        ) : (
          <GroupMembersStep
            conversationId={conversation.id}
            membersTitle={tg.sidebarInfo.members}
            membersCount={conversation.members?.length || 0}
            addMemberLabel={tg.sidebarInfo.addMember}
            addFriendLabel={tg.sidebar.addFriend}
            currentUserRole={currentUserRole}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onLeaveGroup={handleLeaveGroup}
            onMemberClick={(member) => {
              if (member.isCurrentUser || member.userId === user?.id) {
                setIsOwnerProfileOpen(true)
                return
              }
              setSelectedProfileUserId(member.userId)
              setIsOthersProfileOpen(true)
            }}
          />
        )}
      </div>

      <LeaveGroupDialog
        open={isLeaveGroupDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsLeaveGroupDialogOpen(nextOpen)
          if (!nextOpen) setPendingTransferTargetId(null)
        }}
        conversationId={conversation.id}
        transferTargetUserId={pendingTransferTargetId}
      />

      <TransferOwnerDialog
        open={isTransferOwnerDialogOpen}
        onOpenChange={setIsTransferOwnerDialogOpen}
        members={conversation.members || []}
        currentUserId={user?.id}
        onSelect={(targetUserId) => {
          setPendingTransferTargetId(targetUserId)
          setIsLeaveGroupDialogOpen(true)
        }}
      />

      {isAddMemberOpen && (
        <CreateGroupDialog
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          conversationId={conversation.id}
        />
      )}

      <OwnerProfileDialog open={isOwnerProfileOpen} onOpenChange={setIsOwnerProfileOpen} />
      <OthersProfileDialog
        open={isOthersProfileOpen}
        onOpenChange={setIsOthersProfileOpen}
        userId={selectedProfileUserId}
      />
    </div>
  )
}
