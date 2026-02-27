import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { NotificationType } from '@/constants'
import React from 'react'
import { MessageCircle, Heart, UserCheck, Gift, Phone, MessageSquare, User, Shield, AtSign } from 'lucide-react'

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
      return { icon: UserCheck, color: 'bg-green-500' }
    case 'DOB':
      return { icon: Gift, color: 'bg-pink-500' }
    case 'CALL':
      return { icon: Phone, color: 'bg-green-500' }
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return { icon: MessageSquare, color: 'bg-green-500' }
    case 'POST_TAG':
    case 'POST_MENTION':
    case 'COMMENT_MENTION':
      return { icon: AtSign, color: 'bg-brand-blue' }
    case 'SYSTEM':
      return { icon: Shield, color: 'bg-brand-blue' }
    default:
      return { icon: User, color: 'bg-gray-500' }
  }
}

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  const badge = getBadgeConfig(notification.type)

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex cursor-pointer gap-3 p-2 mx-2 rounded-lg transition-all duration-200 hover:bg-muted/60 relative',
        !notification.isRead && 'bg-brand-blue-light/30 dark:bg-brand-blue/5'
      )}
    >
      <div className='relative shrink-0'>
        <Avatar className='h-14 w-14'>
          <AvatarImage src={`/avatars/${notification.actorIds[0]}.png`} />
          <AvatarFallback className='bg-primary/5 text-primary text-lg font-bold'>
            {notification.title.substring(0, 1).toUpperCase()}
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

      <div className='flex flex-1 flex-col gap-0.5 min-w-0 pr-6'>
        <div className='text-[15px] leading-[1.3] text-foreground'>
          <span className='font-bold'>{notification.title}</span> {notification.body}
        </div>
        <div className='text-[13px] text-muted-foreground mt-0.5'>
          {formatDistanceToNow(new Date(notification.lastModifiedAt), { addSuffix: false, locale: vi })}
        </div>

        {notification.type === 'FRIEND_REQUEST' && (
          <div className='mt-2 space-y-3'>
            <div className='text-[13px] text-muted-foreground'>Có 2,1K người theo dõi</div>
            <div className='flex gap-2'>
              <Button
                variant='secondary'
                className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  // Logic for reject will go here
                }}
              >
                Từ chối
              </Button>
              <Button
                variant='secondary-blue'
                className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  // Logic for accept will go here
                }}
              >
                Đồng ý
              </Button>
            </div>
          </div>
        )}
      </div>

      {!notification.isRead && (
        <div className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center h-full'>
          <div className='h-3 w-3 rounded-full bg-brand-blue shadow-sm' />
        </div>
      )}
    </div>
  )
}
