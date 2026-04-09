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

interface GroupSubStepProps {
  conversation: ConversationResponse
  currentUserRole: GroupMemberRole
  step: 'management' | 'members'
  onBack: () => void
}

export function GroupSubStep({ conversation, currentUserRole, step, onBack }: GroupSubStepProps) {
  const { text: tg } = useChatText()
  const { user } = useAuth()

  const isOwner = currentUserRole === GroupMemberRole.Owner

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false)
  const [isTransferOwnerDialogOpen, setIsTransferOwnerDialogOpen] = useState(false)
  const [pendingTransferTargetId, setPendingTransferTargetId] = useState<string | null>(null)

  const isOverlayDialogOpen = isAddMemberOpen || isLeaveGroupDialogOpen || isTransferOwnerDialogOpen

  const handleLeaveGroup = () => {
    if (isOwner) {
      setIsTransferOwnerDialogOpen(true)
    } else {
      setIsLeaveGroupDialogOpen(true)
    }
  }

  return (
    <div
      className={cn(
        'w-87.5 border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0 shadow-xl min-[1150px]:shadow-none min-[1150px]:relative absolute right-0 top-0',
        isOverlayDialogOpen ? 'z-40' : 'z-100'
      )}
    >
      <div className='h-17 flex items-center border-b border-border shrink-0 px-4'>
        <button
          onClick={onBack}
          className='p-1 -ml-1 hover:bg-muted rounded-full transition-colors outline-none cursor-pointer shrink-0'
        >
          <ArrowLeft className='w-5 h-5 text-foreground' />
        </button>
        <h2 className='font-bold text-[16px] text-foreground flex-1 text-center pr-6'>
          {step === 'management' ? tg['group-info-dialog'].managementTitle : tg.sidebarInfo.members}
        </h2>
      </div>

      <div className='flex-1 overflow-hidden'>
        {step === 'management' ? (
          <GroupManagementStep
            text={tg['group-info-dialog']}
            conversationId={conversation.id}
            currentUserRole={currentUserRole}
            onDisbandSuccess={onBack}
          />
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
    </div>
  )
}
