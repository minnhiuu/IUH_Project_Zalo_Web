import { useMemo } from 'react'
import { GroupMemberRole } from '@/constants/enum'
import { usePromoteToAdminMutation } from '../../../queries/use-mutations'
import type { ConversationMemberResponse, SearchMemberResponse } from '../../../schemas/chat.schema'
import { MemberSelectionDialog } from './member-selection-dialog'

interface PromoteAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  members: ConversationMemberResponse[]
}

export function PromoteAdminDialog({ open, onOpenChange, conversationId, members }: PromoteAdminDialogProps) {
  const { mutateAsync: promoteToAdmin, isPending } = usePromoteToAdminMutation()

  const nonAdminMembers = useMemo(() => {
    return (members || [])
      .filter((m) => m.role === GroupMemberRole.Member)
      .map((m) => ({
        userId: m.userId,
        fullName: m.fullName,
        avatar: m.avatar,
        isAlreadyMember: false
      })) as SearchMemberResponse[]
  }, [members])

  const handleConfirm = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return
    try {
      for (const userId of selectedIds) {
        await promoteToAdmin({ conversationId, targetUserId: userId })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to promote admins:', error)
    }
  }

  return (
    <MemberSelectionDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title='Điều chỉnh phó nhóm'
      confirmText='Xác nhận'
      onConfirm={handleConfirm}
      isPending={isPending}
      staticMembers={nonAdminMembers}
      maxSelection={nonAdminMembers.length}
    />
  )
}
