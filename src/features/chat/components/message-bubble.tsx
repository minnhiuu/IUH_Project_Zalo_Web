import { cn } from '@/lib/utils'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'

export function MessageBubble({ 
  message, 
  isOwn, 
  isFirst = true, 
  isLast = true 
}: { 
  message: MessageResponse; 
  isOwn: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const { text } = useChatText()
  return (
    <div className={cn(
      'flex w-full space-x-3',
      isOwn ? 'justify-end' : 'justify-start',
      isFirst ? 'mt-4' : 'mt-1'
    )}>
      {!isOwn && (
        <div className="w-8 shrink-0 flex items-end">
          {isLast ? (
            <img
              src={message.senderAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${message.senderId}`}
              alt={message.senderName || 'User'}
              className='w-8 h-8 rounded-full border border-black/5'
            />
          ) : <div className="w-8 h-8" />}
        </div>
      )}

      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2 max-w-[28rem] break-words text-[15px] shadow-sm flex flex-col',
            isOwn 
              ? 'bg-[#e5efff] text-black dark:bg-primary dark:text-primary-foreground' 
              : 'bg-white dark:bg-zinc-900 text-foreground',
            // Logic bo góc Zalo
            isOwn 
              ? cn('rounded-2xl', !isFirst && 'rounded-tr-md', !isLast && 'rounded-br-md')
              : cn('rounded-2xl', !isFirst && 'rounded-tl-md', !isLast && 'rounded-bl-md'),
            message.status === 'PENDING' && 'opacity-70'
          )}
        >
          <span>{message.content}</span>
          
          {isLast && (
            <div className={cn(
              "flex items-center mt-1 font-medium self-start",
              isOwn ? "text-black/50 dark:text-primary-foreground/70" : "text-muted-foreground"
            )}>
              <span className="text-[11px]">
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
            </div>
          )}
        </div>
        
        {isOwn && isLast && (
          <span className="text-[11px] text-muted-foreground mt-1 px-1 select-none">
            {message.status === 'PENDING' ? text.status.sending : text.status.sent}
          </span>
        )}
      </div>
    </div>
  )
}
