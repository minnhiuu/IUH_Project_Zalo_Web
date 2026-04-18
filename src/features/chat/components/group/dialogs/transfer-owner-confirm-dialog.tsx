import { BaseDialog } from '@/components/common/base-dialog'
import { useChatText } from '../../../i18n/use-chat-text'

interface TransferOwnerConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

export function TransferOwnerConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending
}: TransferOwnerConfirmDialogProps) {
  const { text } = useChatText()
  const labels = text['group-info-dialog'].actions.transferOwnerWarning

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={labels.title}
      description={labels.description}
      confirmText={labels.confirm}
      cancelText={labels.cancel}
      onConfirm={onConfirm}
      isPending={isPending}
      variant='danger'
      className='w-120 max-w-[95vw]'
    />
  )
}
