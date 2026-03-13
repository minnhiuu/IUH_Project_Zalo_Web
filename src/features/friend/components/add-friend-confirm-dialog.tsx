import { useState, useEffect } from 'react'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { UserAvatar } from '@/components/common/user-avatar'
import { useFriendText } from '../i18n/use-friend-text'
import { useSendFriendRequest } from '../queries'
import { useAuth } from '@/features/auth/hooks/use-auth'
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

  // Reset message when dialog opens
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
          onOpenChange(false)
          onSuccess?.()
        }
      }
    )
  }

  const handleViewProfile = () => {
    // TODO: Open profile dialog
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-100 p-0 gap-0 overflow-hidden' showCloseButton>
        {/* Header with back button */}
        <div className='flex items-center gap-2 px-2 py-2 border-b border-border'>
          {onBack && (
            <Button variant='ghost' size='icon' onClick={onBack} className='h-8 w-8'>
              <ChevronLeft className='w-5 h-5' />
            </Button>
          )}
          <h2 className='text-[15px] font-semibold text-foreground flex-1'>
            {text.addFriend.accountInfo}
          </h2>
        </div>

        {/* Cover Image & Avatar */}
        <div className='relative'>
          <div className='h-30 bg-linear-to-r from-blue-400 via-blue-500 to-cyan-400 overflow-hidden'>
            <img
              src={DEFAULT_COVER_IMAGE}
              alt='Cover'
              className='w-full h-full object-cover'
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div className='absolute -bottom-10 left-4'>
            <UserAvatar
              src={user.avatar}
              name={user.fullName}
              className='w-20 h-20 border-4 border-background'
            />
          </div>
        </div>

        {/* User Info */}
        <div className='pt-12 px-4 pb-4'>
          <div className='flex items-center gap-2'>
            <h3 className='text-[17px] font-semibold text-foreground'>{user.fullName}</h3>
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
              className='min-h-20 resize-none text-[14px] pr-16'
            />
            <span className='absolute bottom-2 right-3 text-[12px] text-muted-foreground'>
              {message.length}/{MAX_MESSAGE_LENGTH} {text.addFriend.characters}
            </span>
          </div>
        </div>

        {/* Block Diary Toggle */}
        <div className='px-4 pb-4'>
          <div className='flex items-center justify-between py-2'>
            <span className='text-[14px] text-foreground'>{text.addFriend.blockDiary}</span>
            <Switch checked={blockDiary} onCheckedChange={setBlockDiary} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30'>
          <Button variant='outline' onClick={handleViewProfile} className='px-4 h-9 text-[14px]'>
            {text.addFriend.viewInfo}
          </Button>
          <Button
            onClick={handleSendRequest}
            disabled={sendRequestMutation.isPending}
            className='px-4 h-9 text-[14px]'
          >
            {sendRequestMutation.isPending ? text.loading : text.actions.addFriend}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
