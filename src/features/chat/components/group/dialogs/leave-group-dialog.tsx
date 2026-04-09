import { useState } from 'react'
import { BaseDialog } from '@/components/common/base-dialog'
import { Switch } from '@/components/ui/switch'
import { useChatText } from '../../../i18n/use-chat-text'
import { useLeaveGroupMutation } from '../../../queries/use-mutations'
import { showErrorToast, showSuccessToast } from '@/utils/toast'

interface LeaveGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  transferTargetUserId?: string | null
}

export function LeaveGroupDialog({ open, onOpenChange, conversationId, transferTargetUserId }: LeaveGroupDialogProps) {
  const { text } = useChatText()
  const leaveDialogText = text['group-info-dialog'].actions.leaveDialog
  const { mutate: leaveGroup, isPending } = useLeaveGroupMutation()
  const [silent, setSilent] = useState(false)
  const NAVIGATE_DELAY_MS = 900

  const handleConfirm = () => {
    leaveGroup(
      {
        conversationId,
        silent,
        navigateDelayMs: NAVIGATE_DELAY_MS,
        ...(transferTargetUserId ? { transferTo: transferTargetUserId } : {})
      },
      {
        onSuccess: () => {
          showSuccessToast(text.toasts.leaveGroupSuccess, NAVIGATE_DELAY_MS)
          setSilent(false)
          onOpenChange(false)
        },
        onError: () => {
          showErrorToast(text.toasts.leaveGroupError)
        }
      }
    )
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSilent(false)
        }
        onOpenChange(nextOpen)
      }}
      title={leaveDialogText.title}
      description={leaveDialogText.description}
      confirmText={leaveDialogText.confirm}
      cancelText={leaveDialogText.cancel}
      variant='danger'
      onConfirm={handleConfirm}
      isPending={isPending}
      className='w-136 max-w-[95vw]'
    >
      <div className='mt-4 rounded-md bg-muted/50 px-4 py-3 flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-[15px] font-semibold text-foreground'>{leaveDialogText.silentTitle}</p>
          <p className='text-[14px] text-muted-foreground leading-normal mt-1'>{leaveDialogText.silentDescription}</p>
        </div>
        <Switch checked={silent} onCheckedChange={setSilent} />
      </div>
    </BaseDialog>
  )
}
