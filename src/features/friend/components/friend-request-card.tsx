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
    <div className='bg-background rounded-xl border border-(--friend-card-border) p-4 flex flex-col shadow-sm'>
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
          <p className='text-[13px] text-muted-foreground font-medium'>
            {formattedDate} - {text.requestCard.sourcePhone}
          </p>
        </div>
        <button type='button' className='p-1.5 hover:bg-muted rounded-md transition-colors'>
          <MessageSquare className='w-4 h-4 text-muted-foreground/80' />
        </button>
      </div>

      {/* Message */}
      {request.message && (
        <div className='mt-3 bg-(--friend-message-bg) rounded-md p-3 border border-(--friend-message-border)'>
          <p className='text-[13px] leading-relaxed text-foreground/90 line-clamp-2'>{request.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-2 mt-4'>
        <Button
          variant='secondary'
          onClick={onDecline}
          disabled={isDeclining || isAccepting}
          className='flex-1 h-10 text-[14px] font-semibold bg-(--friend-btn-muted) hover:bg-(--friend-btn-muted-hover) text-foreground/90'
        >
          {text.requestCard.decline}
        </Button>
        <Button
          onClick={onAccept}
          disabled={isAccepting || isDeclining}
          className='flex-1 h-10 text-[14px] font-semibold bg-(--friend-btn-primary) hover:bg-(--friend-btn-primary-hover) text-(--friend-btn-primary-text)'
        >
          {text.requestCard.accept}
        </Button>
      </div>
    </div>
  )
}
