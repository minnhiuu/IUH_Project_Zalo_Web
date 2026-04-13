import { useChatText } from '@/features/chat/i18n/use-chat-text'
import { usePromoteToAdminMutation } from '../../../queries/use-mutations'
import { MemberSelectionDialog } from './member-selection-dialog'

interface PromoteAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
}

export function PromoteAdminDialog({ open, onOpenChange, conversationId }: PromoteAdminDialogProps) {
  const { text } = useChatText()
  const tg = text['group-info-dialog'].actions
  const tc = text['create-group-dialog']
  const { mutateAsync: promoteToAdmin, isPending } = usePromoteToAdminMutation()

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
      title={tg.adjustDeputy}
      confirmText={tc.confirm}
      onConfirm={handleConfirm}
      isPending={isPending}
      conversationId={conversationId}
      type='admin-candidates'
    />
  )
}
