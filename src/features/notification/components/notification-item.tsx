import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'
import { cn } from '@/lib/utils'
import { NotificationType } from '@/constants'
import React, { useState } from 'react'
import { useNotificationText } from '../locales/use-notification-text'
import {
  MessageCircle,
  Heart,
  Gift,
  Phone,
  User,
  Shield,
  AtSign,
  UserPlus,
  AlertTriangle,
  Trash2,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatTimeAgo } from '@/utils/date'
import { useAcceptFriendRequest, useDeclineFriendRequest } from '@/features/friend/queries/use-mutations'
import { useNavigate, useSearchParams } from 'react-router'
import { PATHS } from '@/constants/path'

interface NotificationItemProps {
  notification: NotificationGroupResponse
  onMarkAsRead: (id: string) => void
}

const MODERATION_TYPES: ReadonlySet<string> = new Set(['CONTENT_REMOVED', 'CONTENT_HIDDEN', 'USER_WARNED'])

const isModerationNotification = (type: NotificationType) => MODERATION_TYPES.has(type)

const getBadgeConfig = (type: NotificationType) => {
  switch (type) {
    case 'MESSAGE_DIRECT':
      return { icon: MessageCircle, color: 'bg-green-500' }
    case 'POST_LIKE':
    case 'COMMENT_LIKE':
      return { icon: Heart, color: 'bg-brand-blue' }
    case 'POST_PUBLISHED':
      return { icon: MessageCircle, color: 'bg-brand-blue' }
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
    case 'CONTENT_REMOVED':
      return { icon: Trash2, color: 'bg-destructive' }
    case 'CONTENT_HIDDEN':
      return { icon: EyeOff, color: 'bg-orange-500' }
    case 'USER_WARNED':
      return { icon: AlertCircle, color: 'bg-orange-500' }
    case 'NEW_DEVICE_LOGIN':
      return { icon: Shield, color: 'bg-orange-500' }
    default:
      return { icon: User, color: 'bg-gray-500' }
  }
}

export const NotificationItem = React.memo(({ notification, onMarkAsRead }: NotificationItemProps) => {
  const { action } = useNotificationText()
  const { i18n } = useTranslation()
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const isHighlighted = highlightId === notification.id
  const acceptRequestMutation = useAcceptFriendRequest()
  const declineRequestMutation = useDeclineFriendRequest()

  const getModerationTargetPostId = (): string | null => {
    if (!isModerationNotification(notification.type)) return null

    if (notification.type === 'USER_WARNED') {
      // For USER_WARNED, the targetId is in the payload (post/comment that triggered the warning)
      const targetId = notification.payload?.targetId as string | undefined
      const targetType = notification.payload?.targetType as string | undefined
      if (targetId && (!targetType || targetType === 'post')) return targetId
      return null
    }

    // For CONTENT_REMOVED / CONTENT_HIDDEN, referenceId is the post/comment ID
    const targetType = notification.payload?.targetType as string | undefined
    if (notification.referenceId && (!targetType || targetType === 'post')) {
      return notification.referenceId
    }
    return null
  }

  const getPostNotificationPostId = (): string | null => {
    if (
      notification.type === 'POST_PUBLISHED' ||
      notification.type === 'POST_COMMENT' ||
      notification.type === 'POST_LIKE'
    ) {
      if (notification.referenceId) return notification.referenceId
      const payloadPostId = notification.payload?.postId as string | undefined
      return payloadPostId ?? null
    }

    if (notification.type === 'COMMENT_REPLY') {
      const payloadPostId = notification.payload?.postId as string | undefined
      return payloadPostId ?? null
    }

    return null
  }

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    if (notification.type === 'NEW_DEVICE_LOGIN') {
      window.dispatchEvent(
        new CustomEvent('open-new-device-login-modal', {
          detail: {
            deviceName: notification.payload?.deviceName as string,
            ipAddress: notification.payload?.ipAddress as string,
            loginTime: notification.lastModifiedAt,
            sessionId: notification.payload?.sessionId as string
          }
        })
      )
      return
    }

    // Handle friend requests and other system notifications
    if (notification.type === 'FRIEND_REQUEST' || notification.type === 'FRIEND_ACCEPT') {
      navigate(`${PATHS.NOTIFICATIONS}?highlight=${notification.id}`)
      return
    }

    // Handle post-related notifications
    const postId = getModerationTargetPostId() ?? getPostNotificationPostId()
    if (postId) {
      navigate(`${PATHS.SOCIAL_FEED}?postId=${postId}`)
      return
    }

    // Default: navigate to notifications page
    navigate(`${PATHS.NOTIFICATIONS}?highlight=${notification.id}`)
  }

  const handleAcceptRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const requestId = (notification.payload?.requestId || notification.referenceId) as string
    if (!requestId || requestId === 'undefined') return

    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    acceptRequestMutation.mutate(
      {
        requestId,
        requesterId: notification.actorIds?.[0]
      },
      {
        onSuccess: () => {
          setStatus('accepted')
        }
      }
    )
  }

  const handleDeclineRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const requestId = (notification.payload?.requestId || notification.referenceId) as string
    if (!requestId || requestId === 'undefined') return

    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    declineRequestMutation.mutate(
      {
        requestId,
        requesterId: notification.actorIds?.[0]
      },
      {
        onSuccess: () => {
          setStatus('declined')
        }
      }
    )
  }
  const badge = getBadgeConfig(notification.type)
  const isModeration = isModerationNotification(notification.type)

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex cursor-pointer gap-3 p-2 mx-2 rounded-lg transition-all duration-200 hover:bg-muted/60 relative',
        !notification.read && 'bg-brand-blue-light/20 dark:bg-brand-blue/5',
        isHighlighted &&
          'ring-2 ring-brand-blue/30 bg-brand-blue/5 border border-brand-blue/20 animate-in fade-in zoom-in duration-500'
      )}
    >
      <div className='relative shrink-0 h-14 w-14'>
        {isModeration ? (
          <div
            className={cn(
              'h-14 w-14 rounded-full flex items-center justify-center',
              notification.type === 'CONTENT_REMOVED' ? 'bg-destructive/10' : 'bg-orange-500/10'
            )}
          >
            <Shield
              className={cn(
                'h-7 w-7',
                notification.type === 'CONTENT_REMOVED' ? 'text-destructive' : 'text-orange-500'
              )}
              strokeWidth={2}
            />
          </div>
        ) : (
          <UserAvatar
            src={notification.payload?.actorAvatar as string}
            name={(notification.payload?.actorName as string) || 'U'}
            className='h-14 w-14'
            fallbackClassName='text-lg font-bold'
          />
        )}
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
          dangerouslySetInnerHTML={{
            __html: notification.translations?.[i18n.language.split('-')[0]]?.body || notification.body
          }}
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
                  disabled={declineRequestMutation.isPending || acceptRequestMutation.isPending}
                >
                  {declineRequestMutation.isPending ? '...' : action.decline}
                </Button>
                <Button
                  variant='secondary-blue'
                  className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
                  onClick={(e) => handleAcceptRequest(e)}
                  disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
                >
                  {acceptRequestMutation.isPending ? '...' : action.accept}
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
