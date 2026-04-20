import { useState } from 'react'
import { BaseDialog } from '@/components/common/base-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useChatText } from '../../../i18n/use-chat-text'
import { useRemoveMemberFromGroupMutation } from '../../../queries/use-mutations'
import { Label } from '@/components/ui/label'

interface RemoveMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  targetUserId: string
}

export function RemoveMemberDialog({ open, onOpenChange, conversationId, targetUserId }: RemoveMemberDialogProps) {
  const { text } = useChatText()
  const si = text.sidebarInfo
  const [blockFromGroup, setBlockFromGroup] = useState(false)
  const { mutate: removeMember, isPending } = useRemoveMemberFromGroupMutation()

  const handleConfirm = () => {
    removeMember(
      { conversationId, targetUserId, blockFromGroup },
      {
        onSuccess: () => {
          onOpenChange(false)
          setBlockFromGroup(false)
        }
      }
    )
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setBlockFromGroup(false)
      }}
      title={si.removeFromGroupConfirmTitle}
      confirmText={si.confirmAccept}
      cancelText={si.closeDialog}
      onConfirm={handleConfirm}
      isPending={isPending}
      className='w-[360px]'
      hideFooterBorder
    >
      <div className='flex flex-col gap-5 px-5'>
        <p className='text-[14px] text-foreground font-normal leading-normal'>{si.removeFromGroupConfirmDesc}</p>

        <div className='flex items-center space-x-3'>
          <Checkbox
            id='block-rejoin'
            checked={blockFromGroup}
            onCheckedChange={(checked) => setBlockFromGroup(!!checked)}
            className='h-[18px] w-[18px] rounded-sm'
          />
          <Label htmlFor='block-rejoin' className='cursor-pointer'>
            <span className='text-[14px] text-foreground font-normal leading-normal'>{si.blockFromGroupDesc}</span>
          </Label>
        </div>
      </div>
    </BaseDialog>
  )
}
