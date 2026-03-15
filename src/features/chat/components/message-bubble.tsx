import { cn } from '@/lib/utils'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'

export function MessageBubble({ message, isOwn }: { message: MessageResponse; isOwn: boolean }) {
  const { text } = useChatText()
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
            isOwn ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' : 'bg-muted text-foreground rounded-2xl rounded-tl-sm',
            message.status === 'PENDING' && 'opacity-70'
          )}
        >
          {message.content}
        </div>
        <span className={cn('text-[11px] text-muted-foreground px-1 select-none flex items-center space-x-1 mt-0.5', isOwn && 'justify-end')}>
          <span>
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
          {isOwn && message.status === 'PENDING' && <span>· {text.status.sending}</span>}
          {isOwn && (message.status === 'SENT' || !message.status) && <span>· {text.status.sent}</span>}
        </span>
      </div>
    </div>
  )
}
