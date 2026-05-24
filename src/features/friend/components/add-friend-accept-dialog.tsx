import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { UserAvatar } from '@/components/common/user-avatar'
import { useFriendText } from '../i18n/use-friend-text'
import { useAcceptFriendRequest } from '../queries'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { UserSummaryResponse } from '@/shared/user/user-summary'

interface AddFriendAcceptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserSummaryResponse
  friendshipId: string
  onSuccess?: () => void
}

export function AddFriendAcceptDialog({
  open,
  onOpenChange,
  user,
  friendshipId,
  onSuccess
}: AddFriendAcceptDialogProps) {
  const { text } = useFriendText()
  const [blockDiary, setBlockDiary] = useState(false)
  const acceptRequestMutation = useAcceptFriendRequest()

  const handleAccept = () => {
    acceptRequestMutation.mutate({ requestId: friendshipId }, {
      onSuccess: () => {
        showSuccessToast(text.toast.acceptSuccess)
        onOpenChange(false)
        onSuccess?.()
      },
      onError: () => {
        showErrorToast(text.toast.acceptError)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-sm p-0 gap-0 sm:rounded-lg border shadow-lg' showCloseButton>
        {/* Header */}
        <DialogHeader className='px-4 pt-4 pb-3 border-b border-border bg-background'>
          <DialogTitle className='text-base font-semibold text-foreground'>
            {text.dialogs.addFriendAccept.title}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className='px-4 py-4 space-y-4'>
          {/* User Info */}
          <div className='flex items-center gap-3'>
            <UserAvatar src={user.avatar} name={user.fullName} className='w-12 h-12 shrink-0' />
            <div className='flex-1 min-w-0'>
              <h3 className='text-sm font-semibold text-text-primary'>{user.fullName}</h3>
              <p className='text-xs text-text-secondary mt-0.5'>{text.dialogs.addFriendAccept.subtitle}</p>
            </div>
          </div>

          {/* Block Diary Toggle */}
          <div className='flex items-center justify-between py-2'>
            <span className='text-sm text-text-primary'>{text.addFriend.blockDiary}</span>
            <Switch checked={blockDiary} onCheckedChange={setBlockDiary} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/30'>
          <Button variant='outline' onClick={() => onOpenChange(false)} className='flex-1 h-9 text-sm'>
            {text.dialogs.addFriendAccept.cancel}
          </Button>
          <Button onClick={handleAccept} disabled={acceptRequestMutation.isPending} className='flex-1 h-9 text-sm'>
            {acceptRequestMutation.isPending ? text.loading : text.dialogs.addFriendAccept.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
