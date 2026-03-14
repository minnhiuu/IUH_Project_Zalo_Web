import { cn } from '@/lib/utils'
import type { MessageResponse } from '../schemas/chat.schema'

export function MessageBubble({ message, isOwn }: { message: MessageResponse; isOwn: boolean }) {
  return (
    <div className={cn('flex w-full mt-4 space-x-3', isOwn ? 'ml-auto justify-end' : '')}>
      {!isOwn && (
        <img
          src={message.senderAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${message.senderId}`}
          alt={message.senderName || 'User'}
          className='w-8 h-8 rounded-full flex-shrink-0 border border-black/5 mt-auto'
        />
      )}
      <div className={cn('flex flex-col space-y-1', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 max-w-[28rem] break-words text-[15px]',
            isOwn ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' : 'bg-muted text-foreground rounded-2xl rounded-tl-sm'
          )}
        >
          {message.content}
        </div>
        <span className='text-[11px] text-muted-foreground px-1 select-none'>
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
      </div>
    </div>
  )
}
