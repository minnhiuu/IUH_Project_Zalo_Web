import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { BaseProfileDialog } from '@/features/user/components/profile-dialog/shared/base-profile-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { UserAvatar } from '@/components/common/user-avatar'
import { useFriendText } from '../i18n/use-friend-text'
import { useSendFriendRequest } from '../queries'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { UserSummaryResponse } from '@/shared/user/user-summary'

const MAX_MESSAGE_LENGTH = 150
const DEFAULT_COVER_IMAGE = '/images/default-cover.jpg'

interface AddFriendConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserSummaryResponse
  onBack?: () => void
  onSuccess?: () => void
}

export function AddFriendConfirmDialog({
  open,
  onOpenChange,
  user,
  onBack,
  onSuccess
}: AddFriendConfirmDialogProps) {
  const { text } = useFriendText()
  const { user: currentUser } = useAuth()
  const sendRequestMutation = useSendFriendRequest()

  const defaultMessage = currentUser?.fullName
    ? `${text.addFriend.defaultMessagePrefix}${currentUser.fullName}`
    : ''

  const [message, setMessage] = useState(defaultMessage)
  const [blockDiary, setBlockDiary] = useState(false)

  useEffect(() => {
    if (open) {
      setMessage(defaultMessage)
      setBlockDiary(false)
    }
  }, [open, defaultMessage])

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value)
    }
  }

  const handleSendRequest = () => {
    sendRequestMutation.mutate(
      { receiverId: user.id, message: message || undefined },
      {
        onSuccess: () => {
          showSuccessToast(text.toast.sendSuccess)
          onOpenChange(false)
          onSuccess?.()
        },
        onError: () => {
          showErrorToast(text.toast.sendError)
        }
      }
    )
  }

  return (
    <BaseProfileDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.addFriend.accountInfo}
      onBack={onBack}
    >
      <div className='flex-1 overflow-y-auto'>
        {/* Cover Image & Avatar */}
        <div className='relative'>
          <div className='h-24 bg-linear-to-r from-blue-400 via-blue-500 to-cyan-400 overflow-hidden'>
            <img
              src={DEFAULT_COVER_IMAGE}
              alt='Cover'
              className='w-full h-full object-cover'
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div className='absolute -bottom-9 left-4'>
            <UserAvatar
              src={user.avatar}
              name={user.fullName}
              className='w-18 h-18 border-4 border-background'
            />
          </div>
        </div>

        {/* User Info */}
        <div className='pt-11 px-4 pb-4'>
          <div className='flex items-center gap-2'>
            <h3 className='text-base font-semibold text-foreground'>{user.fullName}</h3>
            <button className='p-1 hover:bg-muted rounded-full transition-colors'>
              <Pencil className='w-4 h-4 text-muted-foreground' />
            </button>
          </div>
        </div>

        {/* Message Input */}
        <div className='px-4 pb-4'>
          <div className='relative'>
            <Textarea
              value={message}
              onChange={handleMessageChange}
              placeholder={text.addFriend.messagePlaceholder}
              className='min-h-20 resize-none text-sm pr-14'
            />
            <span className='absolute bottom-2 right-3 text-xs text-muted-foreground'>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        {/* Block Diary Toggle */}
        <div className='px-4 pb-4'>
          <div className='flex items-center justify-between py-2'>
            <span className='text-sm text-foreground'>{text.addFriend.blockDiary}</span>
            <Switch checked={blockDiary} onCheckedChange={setBlockDiary} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className='flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30 shrink-0'>
        <Button
          variant='outline'
          onClick={() => onOpenChange(false)}
          className='px-4 h-9 text-sm'
        >
          {text.dialogs.addFriendConfirm.cancel}
        </Button>
        <Button
          onClick={handleSendRequest}
          disabled={sendRequestMutation.isPending}
          className='px-4 h-9 text-sm'
        >
          {sendRequestMutation.isPending ? text.loading : text.actions.addFriend}
        </Button>
      </div>
    </BaseProfileDialog>
  )
}
