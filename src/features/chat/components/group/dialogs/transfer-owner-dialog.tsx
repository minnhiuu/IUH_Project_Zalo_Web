import { useMemo } from 'react'
import { GroupMemberRole } from '@/constants/enum'
import type { ConversationMemberResponse, SearchMemberResponse } from '../../../schemas/chat.schema'
import { MemberSelectionDialog } from './member-selection-dialog'
import { useChatText } from '../../../i18n/use-chat-text'

interface TransferOwnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: ConversationMemberResponse[]
  currentUserId?: string
  onSelect: (targetUserId: string) => void
}

export function TransferOwnerDialog({
  open,
  onOpenChange,
  members,
  currentUserId,
  onSelect
}: TransferOwnerDialogProps) {
  const { text } = useChatText()
  const dialogText = text['group-info-dialog'].actions.transferOwnerDialog

  const eligibleMembers = useMemo(() => {
    return (members || [])
      .filter((m) => m.userId !== currentUserId && m.role?.toUpperCase() !== GroupMemberRole.Owner)
      .map((m) => ({
        userId: m.userId,
        fullName: m.fullName,
        avatar: m.avatar,
        isAlreadyMember: false
      })) as SearchMemberResponse[]
  }, [members, currentUserId])

  const handleConfirm = (selectedIds: string[]) => {
    if (selectedIds.length === 0) return
    onOpenChange(false)
    onSelect(selectedIds[0])
  }

  return (
    <MemberSelectionDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={dialogText.title}
      confirmText={dialogText.confirm}
      onConfirm={handleConfirm}
      staticMembers={eligibleMembers}
      singleSelection={true}
    />
  )
}
