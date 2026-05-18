import { UserAvatar } from '@/components/common/user-avatar'
import {
  X,
  User,
  MessageCircle,
  Heart,
  Gift,
  Phone,
  UserPlus,
  AtSign,
  Shield,
  AlertTriangle,
  Trash2,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatTimeAgo } from '@/utils/date'
import { cn } from '@/lib/utils'
import { NotificationType } from '@/constants'
import { Button } from '@/components/ui/button'
import { useAcceptFriendRequest, useDeclineFriendRequest } from '@/features/friend/queries/use-mutations'
import { useMarkAsReadMutation } from '@/features/notification/queries/use-mutations'
import { useNotificationText } from '@/features/notification/locales/use-notification-text'
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'
import { getSystemMessagePreview } from '@/features/chat/utils/system-message-preview'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface NotificationToastProps {
  data: NotificationGroupResponse
  onClose?: () => void
}

const getBadgeConfig = (type: NotificationType) => {
  switch (type) {
    case 'MESSAGE_DIRECT':
      return { icon: MessageCircle, color: 'bg-green-500' }
    case 'POST_REACTION':
    case 'COMMENT_REACTION':
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
    default:
      return { icon: User, color: 'bg-gray-500' }
  }
}

const parseDateArray = (date: string | number[] | Date | null | undefined): Date => {
  if (Array.isArray(date)) {
    const [year, month, day, hour = 0, minute = 0, second = 0, ms = 0] = date
    return new Date(year, month - 1, day, hour, minute, second, Math.floor(ms / 1000000))
  }
  return date ? new Date(date) : new Date()
}

export function NotificationToast({ data, onClose }: NotificationToastProps) {
  const { i18n } = useTranslation()
  const { action } = useNotificationText()
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { t: tChat } = useTranslation('chat')

  // We rely on metadata payload for system message rendering in toasts
  // as fetching the full member list here is overkill and potentially slow
  const members = useMemo(() => [], [])

  const body = useMemo(() => {
    if (data.type === 'SYSTEM' && data.payload?.metadata) {
      return getSystemMessagePreview(
        data.payload.metadata,
        data.actorIds?.[0],
        data.payload?.actorName as string,
        currentUser?.id,
        members,
        tChat
      )
    }
    return data.body
  }, [data.type, data.payload, data.body, data.actorIds, currentUser?.id, members, tChat])

  const acceptRequestMutation = useAcceptFriendRequest()
  const declineRequestMutation = useDeclineFriendRequest()
  const { mutate: markAsRead } = useMarkAsReadMutation()
  if (!data) return null

  const handleToastClick = () => {
    if (!data.read) {
      markAsRead(data.id)
    }

    const params = new URLSearchParams(window.location.search)
    params.set('noti_open', 'true')
    params.set('highlight', data.id)
    navigate({
      pathname: window.location.pathname,
      search: params.toString()
    })

    if (onClose) {
      onClose()
    }
  }
  const badge = getBadgeConfig(data.type)

  const handleAcceptRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const requestId = (data.payload?.requestId || data.referenceId) as string
    if (!requestId || requestId === 'undefined') return

    if (!data.read) {
      markAsRead(data.id)
    }

    acceptRequestMutation.mutate(
      {
        requestId,
        requesterId: data.actorIds?.[0]
      },
      {
        onSuccess: () => {
          setStatus('accepted')
          setTimeout(() => {
            if (onClose) {
              onClose()
            }
          }, 1500)
        }
      }
    )
  }

  const handleDeclineRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const requestId = (data.payload?.requestId || data.referenceId) as string
    if (!requestId || requestId === 'undefined') return

    if (!data.read) {
      markAsRead(data.id)
    }

    declineRequestMutation.mutate(
      {
        requestId,
        requesterId: data.actorIds?.[0]
      },
      {
        onSuccess: () => {
          setStatus('declined')
          setTimeout(() => {
            if (onClose) {
              onClose()
            }
          }, 1500)
        }
      }
    )
  }

  return (
    <div
      onClick={handleToastClick}
      className='relative flex flex-col p-4 w-[340px] bg-background text-foreground shadow-2xl rounded-2xl border border-border/40 group overflow-hidden pointer-events-auto cursor-pointer hover:border-brand-blue/30 transition-all'
    >
      {/* Header Row */}
      <div className='flex justify-between items-center mb-3.5'>
        <span className='text-[16px] font-bold'>{data.title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onClose) onClose()
          }}
          className='cursor-pointer h-7 w-7 flex items-center justify-center rounded-full bg-accent hover:bg-accent-hover transition-colors text-muted-foreground hover:text-foreground'
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      {/* Content Row */}
      <div className='flex items-start gap-4'>
        <div className='relative shrink-0 h-14 w-14'>
          <UserAvatar
            src={data.payload?.actorAvatar as string}
            name={(data.payload?.actorName as string) || (data.title as string) || 'U'}
            className='h-14 w-14 border border-border/50'
            fallbackClassName='text-lg font-bold'
          />
          <div
            className={cn(
              'absolute -right-1 -bottom-1 h-7 w-7 rounded-full border-[3px] border-background flex items-center justify-center text-white',
              badge.color
            )}
          >
            <badge.icon className='h-4 w-4 fill-white' strokeWidth={2.5} />
          </div>
        </div>

        <div className='flex-1 flex flex-col min-w-0'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-col min-w-0 flex-1'>
              <div
                className='text-[15px] leading-[1.3] text-foreground font-medium pr-2 break-words'
                dangerouslySetInnerHTML={{ __html: body || '' }}
              />
              <span className='text-[13px] font-medium text-brand-blue mt-1.5'>
                {formatTimeAgo(parseDateArray(data.lastModifiedAt), i18n.language, true)}
              </span>
            </div>

            {!data.read && (
              <div className='mt-2 shrink-0'>
                <div className='w-3 h-3 rounded-full bg-brand-blue shadow-[0_0_10px_rgba(0,104,255,0.5)] animate-pulse' />
              </div>
            )}
          </div>

          {/* Action Buttons for Friend Request */}
          {data.type === 'FRIEND_REQUEST' && (
            <div className='mt-3'>
              {status === 'pending' ? (
                <div className='flex gap-2'>
                  <Button
                    variant='secondary'
                    className='h-8.5 flex-1 font-bold text-[14px] rounded-lg border-none shadow-none transition-all active:scale-95'
                    onClick={(e) => handleDeclineRequest(e)}
                    disabled={declineRequestMutation.isPending || acceptRequestMutation.isPending}
                  >
                    {action.decline}
                  </Button>
                  <Button
                    variant='secondary-blue'
                    className='h-8.5 flex-1 font-bold text-[14px] rounded-lg border-none shadow-none transition-all active:scale-95'
                    onClick={(e) => handleAcceptRequest(e)}
                    disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
                  >
                    {action.accept}
                  </Button>
                </div>
              ) : (
                <div className='text-[14px] text-muted-foreground font-medium py-1'>
                  {status === 'accepted' ? action.accepted : action.declined}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
