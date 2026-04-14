import { useState } from 'react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GroupMemberRole } from '@/constants/enum'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { useAuth } from '@/features/auth'
import { useDemoteFromAdminMutation, useTransferOwnerMutation } from '../../../queries/use-mutations'
import { useGroupAdminsInfiniteQuery } from '../../../queries/use-queries'
import { TransferOwnerDialog } from '../dialogs/transfer-owner-dialog'
import { LeaveGroupDialog } from '../dialogs/leave-group-dialog'
import { PromoteAdminDialog } from '@/features/chat/components/group/dialogs/promote-admin-dialog'
import { TransferOwnerConfirmDialog } from '../dialogs/transfer-owner-confirm-dialog'
import { TransferOwnerFinalConfirmDialog } from '../dialogs/transfer-owner-final-confirm-dialog'

import { useChatText } from '../../../i18n/use-chat-text'
import { showSuccessToast } from '@/utils/toast'

interface GroupAdminsStepProps {
  conversation: ConversationResponse
  currentUserRole: GroupMemberRole
  onSuccess?: () => void
}

export function GroupAdminsStep({ conversation, currentUserRole, onSuccess }: GroupAdminsStepProps) {
  const { text: tg } = useChatText()
  const { user } = useAuth()
  const { mutate: demoteFromAdmin } = useDemoteFromAdminMutation()
  const { mutate: transferOwner, isPending: isTransferring } = useTransferOwnerMutation()

  const labels = tg['group-info-dialog'].actions

  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [isTransferOwnerDialogOpen, setIsTransferOwnerDialogOpen] = useState(false)
  const [isTransferOwnerConfirmOpen, setIsTransferOwnerConfirmOpen] = useState(false)
  const [isTransferOwnerFinalOpen, setIsTransferOwnerFinalOpen] = useState(false)
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false)
  const [pendingTransferTargetId, setPendingTransferTargetId] = useState<string | null>(null)
  const [pendingTransferTargetName, setPendingTransferTargetName] = useState('')

  const isOwner = currentUserRole === GroupMemberRole.Owner
  const { data: adminsData } = useGroupAdminsInfiniteQuery(conversation.id)
  const sortedAdmins = adminsData?.pages.flatMap((page) => page.data) || []

  const handleDemote = (userId: string) => {
    demoteFromAdmin({ conversationId: conversation.id, targetUserId: userId })
  }

  const handleTransferOwner = () => {
    setIsTransferOwnerConfirmOpen(true)
  }

  const handleTransferConfirmAction = () => {
    setIsTransferOwnerConfirmOpen(false)
    setIsTransferOwnerDialogOpen(true)
  }

  const handleFinalTransferSelect = (targetUserId: string) => {
    const targetMember = conversation.members?.find((m) => m.userId === targetUserId)
    if (targetMember) {
      setPendingTransferTargetId(targetUserId)
      setPendingTransferTargetName(targetMember.fullName)
      setIsTransferOwnerFinalOpen(true)
    }
  }

  const handleExecuteTransfer = () => {
    if (!pendingTransferTargetId) return

    transferOwner(
      { conversationId: conversation.id, targetUserId: pendingTransferTargetId },
      {
        onSuccess: () => {
          showSuccessToast('Chuyển quyền trưởng nhóm thành công')
          setIsTransferOwnerFinalOpen(false)
          setIsTransferOwnerDialogOpen(false)
          setPendingTransferTargetId(null)
          setPendingTransferTargetName('')
          onSuccess?.()
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

          {isOwner && (
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
          )}
        </div>
      </ScrollArea>

      {isAddAdminOpen && (
        <PromoteAdminDialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen} conversationId={conversation.id} />
      )}

      <TransferOwnerConfirmDialog
        open={isTransferOwnerConfirmOpen}
        onOpenChange={setIsTransferOwnerConfirmOpen}
        onConfirm={handleTransferConfirmAction}
        isPending={isTransferring}
      />

      <TransferOwnerDialog
        open={isTransferOwnerDialogOpen}
        onOpenChange={setIsTransferOwnerDialogOpen}
        members={conversation.members || []}
        currentUserId={user?.id}
        onSelect={handleFinalTransferSelect}
      />

      <TransferOwnerFinalConfirmDialog
        open={isTransferOwnerFinalOpen}
        onOpenChange={setIsTransferOwnerFinalOpen}
        targetName={pendingTransferTargetName}
        onConfirm={handleExecuteTransfer}
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
