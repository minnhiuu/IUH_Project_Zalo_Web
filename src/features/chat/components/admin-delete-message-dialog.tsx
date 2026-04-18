import { useState } from 'react'
import { BaseDialog } from '@/components/common/base-dialog'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { useDeleteGroupMemberMessageMutation } from '../queries/use-mutations'
import { useChatContext } from '../context/chat-context'

interface AdminDeleteMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: MessageResponse
  conversationId?: string | null
  canDeleteMsgForAll: boolean
}

export function AdminDeleteMessageDialog({
  open,
  onOpenChange,
  message,
  conversationId,
  canDeleteMsgForAll
}: AdminDeleteMessageDialogProps) {
  const { text } = useChatText()
  const mb = text.messageBubble
  const { deleteMessageForMe } = useChatContext()
  const [adminDeleteMode, setAdminDeleteMode] = useState<'me' | 'everyone'>('me')
  const [adminDeleteError, setAdminDeleteError] = useState<string | null>(null)

  const { mutate: deleteGroupMemberMessage, isPending: isAdminDeleting } = useDeleteGroupMemberMessageMutation()

  const handleConfirm = () => {
    if (adminDeleteMode === 'everyone' && canDeleteMsgForAll) {
      if (!conversationId) return
      deleteGroupMemberMessage(
        { conversationId, messageId: message.id },
        {
          onSuccess: () => {
            onOpenChange(false)
            setAdminDeleteError(null)
          },
          onError: () => setAdminDeleteError(text.errors.adminDeleteTimeExceeded)
        }
      )
    } else {
      if (conversationId) deleteMessageForMe(message.id, conversationId)
      onOpenChange(false)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setAdminDeleteError(null)
      }}
      title={mb.adminDeleteDialog.title}
      cancelText={mb.adminDeleteDialog.cancel}
      confirmText={isAdminDeleting ? text.loading : (canDeleteMsgForAll ? mb.adminDeleteDialog.confirm : mb.adminDeleteDialog.confirmForMe)}
      onConfirm={handleConfirm}
      isPending={isAdminDeleting}
      className='w-[320px]'
      compact
      hideHeaderBorder
      hideFooterBorder
    >
      <div className='flex flex-col gap-3 py-1 px-1'>
        <label className='flex items-center gap-3 cursor-pointer group'>
          <input
            type='radio'
            name={`admin-delete-${message.id}`}
            checked={adminDeleteMode === 'me'}
            onChange={() => setAdminDeleteMode('me')}
            className='accent-(--accent-primary) w-4 h-4 cursor-pointer'
          />
          <span className='text-[15px] text-foreground font-medium'>{mb.adminDeleteDialog.optionForMe}</span>
        </label>
        {canDeleteMsgForAll && (
          <label className='flex items-center gap-3 cursor-pointer group'>
            <input
              type='radio'
              name={`admin-delete-${message.id}`}
              checked={adminDeleteMode === 'everyone'}
              onChange={() => setAdminDeleteMode('everyone')}
              className='accent-(--accent-primary) w-4 h-4 cursor-pointer'
            />
            <span className='text-[15px] text-foreground font-medium'>{mb.adminDeleteDialog.optionForAll}</span>
          </label>
        )}
        {adminDeleteError && (
          <p className='text-[12px] text-destructive mt-1 leading-tight text-center bg-destructive/5 py-1.5 rounded-md'>
            {adminDeleteError}
          </p>
        )}
      </div>
    </BaseDialog>
  )
}
