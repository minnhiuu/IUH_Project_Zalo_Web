import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useFriendText } from '../i18n/use-friend-text'
import type { FriendRequestResponse } from '../schemas/friend.schema'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

interface FriendRequestCardProps {
  request: FriendRequestResponse
  onAccept: () => void
  onDecline: () => void
  onViewProfile?: () => void
  isAccepting?: boolean
  isDeclining?: boolean
}

export function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  onViewProfile,
  isAccepting,
  isDeclining
}: FriendRequestCardProps) {
  const { text } = useFriendText()
  const { i18n } = useTranslation()

  const displayName = request.requestedUserName
  const displayAvatar = request.requestedUserAvatar
  const dateLocale = i18n.language === 'vi' ? vi : enUS

  // Format date as dd/MM
  const formattedDate = format(new Date(request.createdAt), 'dd/MM', { locale: dateLocale })

  return (
    <div className='bg-background rounded-lg border border-border p-4 min-w-70 max-w-80 flex flex-col'>
      {/* Header */}
      <div className='flex items-start gap-3'>
        <div className='cursor-pointer' onClick={onViewProfile}>
          <UserAvatar src={displayAvatar} name={displayName} className='w-12 h-12 shrink-0' />
        </div>
        <div className='flex-1 min-w-0'>
          <h4
            className='text-[15px] font-semibold text-foreground truncate cursor-pointer hover:underline'
            onClick={onViewProfile}
          >
            {displayName}
          </h4>
          <p className='text-[13px] text-muted-foreground'>
            {formattedDate} - {text.source.friendSuggestion}
          </p>
        </div>
        <button className='p-1.5 hover:bg-muted rounded-md transition-colors'>
          <MessageSquare className='w-4 h-4 text-muted-foreground' />
        </button>
      </div>

      {/* Message */}
      {request.message && (
        <div className='mt-3 bg-muted/50 rounded-lg p-3 border-l-2 border-primary/30'>
          <p className='text-[13px] text-foreground leading-relaxed line-clamp-3'>{request.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-2 mt-4'>
        <Button
          variant='outline'
          onClick={onDecline}
          disabled={isDeclining || isAccepting}
          className='flex-1 h-9 text-[13px] font-medium'
        >
          {text.actions.decline}
        </Button>
        <Button
          onClick={onAccept}
          disabled={isAccepting || isDeclining}
          className='flex-1 h-9 text-[13px] font-medium'
        >
          {text.actions.accept}
        </Button>
      </div>
    </div>
  )
}
