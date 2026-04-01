import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'
import { cn } from '@/lib/utils'
import { NotificationType } from '@/constants'
import React, { useState } from 'react'
import { useNotificationText } from '../locales/use-notification-text'
import { MessageCircle, Heart, Gift, Phone, User, Shield, AtSign, UserPlus, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatTimeAgo } from '@/utils/date'
import { useAcceptFriendRequest, useDeclineFriendRequest } from '@/features/friend/queries/use-mutations'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

interface NotificationItemProps {
  notification: NotificationGroupResponse
  onMarkAsRead: (id: string) => void
}

const getBadgeConfig = (type: NotificationType) => {
  switch (type) {
    case 'MESSAGE_DIRECT':
      return { icon: MessageCircle, color: 'bg-green-500' }
    case 'POST_LIKE':
    case 'COMMENT_LIKE':
      return { icon: Heart, color: 'bg-brand-blue' }
    case 'FRIEND_REQUEST':
      return { icon: User, color: 'bg-brand-blue' }
    case 'FRIEND_ACCEPT':
      return { icon: UserPlus, color: 'bg-brand-blue' }
    case 'DOB':
      return { icon: Gift, color: 'bg-pink-500' }
    case 'CALL':
      return { icon: Phone, color: 'bg-green-500' }
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return { icon: MessageCircle, color: 'bg-green-500' }
    case 'POST_TAG':
    case 'POST_MENTION':
    case 'COMMENT_MENTION':
      return { icon: AtSign, color: 'bg-brand-blue' }
    case 'SYSTEM':
      return { icon: Shield, color: 'bg-brand-blue' }
    case 'DLQ_ALERT':
      return { icon: AlertTriangle, color: 'bg-destructive' }
    default:
      return { icon: User, color: 'bg-gray-500' }
  }
}

export const NotificationItem = React.memo(({ notification, onMarkAsRead }: NotificationItemProps) => {
  const { action } = useNotificationText()
  const { i18n } = useTranslation()
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const acceptRequestMutation = useAcceptFriendRequest()
  const declineRequestMutation = useDeclineFriendRequest()

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const handleAcceptRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const requestId = notification.payload?.requestId as string
    if (!requestId) return
    acceptRequestMutation.mutate(requestId, {
      onSuccess: () => {
        showSuccessToast('Đã chấp nhận lời mời kết bạn')
        setStatus('accepted')
      },
      onError: () => {
        showErrorToast('Không thể chấp nhận lời mời')
      }
    })
  }

  const handleDeclineRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const requestId = notification.payload?.requestId as string
    if (!requestId) return
    declineRequestMutation.mutate(requestId, {
      onSuccess: () => {
        showSuccessToast('Đã từ chối lời mời kết bạn')
        setStatus('declined')
      },
      onError: () => {
        showErrorToast('Không thể từ chối lời mời')
      }
    })
  }
  const badge = getBadgeConfig(notification.type)

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex cursor-pointer gap-3 p-2 mx-2 rounded-lg transition-all duration-200 hover:bg-muted/60 relative',
        !notification.read && 'bg-brand-blue-light/20 dark:bg-brand-blue/5'
      )}
    >
      <div className='relative shrink-0'>
        <Avatar className='h-14 w-14'>
          {notification.payload?.actorAvatar && <AvatarImage src={notification.payload.actorAvatar as string} />}
          <AvatarFallback className='bg-primary/5 text-primary text-lg font-bold'>
            {((notification.payload?.actorName as string) || 'U').substring(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -right-1 -bottom-1 h-7 w-7 rounded-full border-[3px] border-background flex items-center justify-center text-white',
            badge.color
          )}
        >
          <badge.icon className='h-4 w-4 fill-white' strokeWidth={2.5} />
        </div>
      </div>

      <div className='flex flex-1 flex-col justify-center min-w-0 pr-6'>
        <div
          className={cn(
            'text-[15px] leading-[1.3] overflow-wrap-break-word',
            !notification.read ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}
          dangerouslySetInnerHTML={{ __html: notification.body }}
        />
        <div
          className={cn(
            'text-[13px] mt-1 font-medium',
            !notification.read ? 'text-brand-blue' : 'text-muted-foreground'
          )}
        >
          {formatTimeAgo(notification.lastModifiedAt, i18n.language, true)}
        </div>

        {notification.type === 'FRIEND_REQUEST' && (
          <div className='mt-2'>
            {status === 'pending' ? (
              <div className='flex gap-2'>
                <Button
                  variant='secondary'
                  className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
                  onClick={(e) => handleDeclineRequest(e)}
                >
                  {action.decline}
                </Button>
                <Button
                  variant='secondary-blue'
                  className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
                  onClick={(e) => handleAcceptRequest(e)}
                >
                  {action.accept}
                </Button>
              </div>
            ) : (
              <div className='text-[14px] text-muted-foreground font-normal'>
                {status === 'accepted' ? action.accepted : action.declined}
              </div>
            )}
          </div>
        )}
      </div>

      {!notification.read && (
        <div className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center'>
          <div className='h-3 w-3 rounded-full bg-brand-blue shadow-sm' />
        </div>
      )}
    </div>
  )
})
