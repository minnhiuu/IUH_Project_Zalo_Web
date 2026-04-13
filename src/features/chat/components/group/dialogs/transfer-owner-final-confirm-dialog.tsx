import { BaseDialog } from '@/components/common/base-dialog'
import { useChatText } from '../../../i18n/use-chat-text'

interface TransferOwnerFinalConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  targetName: string
  isPending?: boolean
}

export function TransferOwnerFinalConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  targetName,
  isPending
}: TransferOwnerFinalConfirmDialogProps) {
  const { text } = useChatText()
  const labels = text['group-info-dialog'].actions.transferOwnerFinal

  const description = labels.description.replace('{{name}}', targetName)

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={labels.title}
      description={description}
      confirmText={labels.confirm}
      cancelText={labels.cancel}
      onConfirm={onConfirm}
      isPending={isPending}
      className='w-110 max-w-[90vw]'
    />
  )
}
