import { useState } from 'react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GroupMemberRole } from '@/constants/enum'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { useAuth } from '@/features/auth'
import { useDemoteFromAdminMutation, useTransferOwnerMutation } from '../../../queries/use-mutations'
import { TransferOwnerDialog } from '../dialogs/transfer-owner-dialog'
import { LeaveGroupDialog } from '../dialogs/leave-group-dialog'
import { PromoteAdminDialog } from '@/features/chat/components/group/dialogs/promote-admin-dialog'
import { TransferOwnerConfirmDialog } from '../dialogs/transfer-owner-confirm-dialog'

import { useChatText } from '../../../i18n/use-chat-text'
import { showSuccessToast } from '@/utils/toast'

interface GroupAdminsStepProps {
  conversation: ConversationResponse
  currentUserRole: GroupMemberRole
}

export function GroupAdminsStep({ conversation, currentUserRole }: GroupAdminsStepProps) {
  const { text: tg } = useChatText()
  const { user } = useAuth()
  const { mutate: demoteFromAdmin } = useDemoteFromAdminMutation()
  const { mutate: transferOwner, isPending: isTransferring } = useTransferOwnerMutation()

  const labels = tg['group-info-dialog'].actions

  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [isTransferOwnerDialogOpen, setIsTransferOwnerDialogOpen] = useState(false)
  const [isTransferOwnerConfirmOpen, setIsTransferOwnerConfirmOpen] = useState(false)
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false)
  const [pendingTransferTargetId, setPendingTransferTargetId] = useState<string | null>(null)

  const isOwner = currentUserRole === GroupMemberRole.Owner
  const admins =
    conversation.members?.filter((m) => m.role === GroupMemberRole.Owner || m.role === GroupMemberRole.Admin) || []

  // Sort: Owner first, then Admins
  const sortedAdmins = [...admins].sort((a, b) => {
    if (a.role === GroupMemberRole.Owner) return -1
    if (b.role === GroupMemberRole.Owner) return 1
    return 0
  })

  const handleDemote = (userId: string) => {
    demoteFromAdmin({ conversationId: conversation.id, targetUserId: userId })
  }

  const handleTransferOwner = () => {
    setIsTransferOwnerDialogOpen(true)
  }

  const handleTransferConfirm = () => {
    if (!pendingTransferTargetId) return

    transferOwner(
      { conversationId: conversation.id, targetUserId: pendingTransferTargetId },
      {
        onSuccess: () => {
          showSuccessToast('Chuyển quyền trưởng nhóm thành công')
          setIsTransferOwnerConfirmOpen(false)
          setPendingTransferTargetId(null)
        }
      }
    )
  }

  return (
    <div className='flex flex-col h-full bg-background'>
      <ScrollArea className='flex-1'>
        <div className='flex flex-col'>
          {sortedAdmins.map((member, index) => (
            <div key={member.userId}>
              <div className='flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group'>
                <UserAvatar src={member.avatar} name={member.fullName} className='w-12 h-12' />
                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                  <p className='text-[15px] font-semibold text-foreground truncate'>{member.fullName}</p>
                  <p className='text-[13px] text-muted-foreground'>
                    {member.role === GroupMemberRole.Owner ? labels.owner : labels.admin}
                  </p>
                </div>
                {isOwner && member.role === GroupMemberRole.Admin && (
                  <Button variant='destructive' className='h-8 px-5' onClick={() => handleDemote(member.userId)}>
                    {labels.delete}
                  </Button>
                )}
              </div>
              {index === 0 && <div className='mx-5 h-px bg-border/50' />}
            </div>
          ))}

          <div className='p-4 px-5 space-y-2 mt-2'>
            <Button
              variant='secondary'
              className='w-full h-11 font-bold text-[14px] bg-[#eaedf0] hover:bg-[#dfe2e7] text-foreground border-none rounded-[4px]'
              onClick={() => setIsAddAdminOpen(true)}
            >
              {labels.addDeputy}
            </Button>
            <Button
              variant='secondary'
              className='w-full h-11 font-bold text-[14px] bg-[#eaedf0] hover:bg-[#dfe2e7] text-foreground border-none rounded-[4px]'
              onClick={handleTransferOwner}
            >
              {labels.transferOwner}
            </Button>
          </div>
        </div>
      </ScrollArea>

      {isAddAdminOpen && (
        <PromoteAdminDialog
          open={isAddAdminOpen}
          onOpenChange={setIsAddAdminOpen}
          conversationId={conversation.id}
          members={conversation.members || []}
        />
      )}

      <TransferOwnerDialog
        open={isTransferOwnerDialogOpen}
        onOpenChange={setIsTransferOwnerDialogOpen}
        members={conversation.members || []}
        currentUserId={user?.id}
        onSelect={(targetUserId) => {
          setPendingTransferTargetId(targetUserId)
          setIsTransferOwnerConfirmOpen(true)
        }}
      />

      <TransferOwnerConfirmDialog
        open={isTransferOwnerConfirmOpen}
        onOpenChange={setIsTransferOwnerConfirmOpen}
        onConfirm={handleTransferConfirm}
        isPending={isTransferring}
      />

      <LeaveGroupDialog
        open={isLeaveGroupDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsLeaveGroupDialogOpen(nextOpen)
          if (!nextOpen) setPendingTransferTargetId(null)
        }}
        conversationId={conversation.id}
        transferTargetUserId={pendingTransferTargetId}
      />
    </div>
  )
}
