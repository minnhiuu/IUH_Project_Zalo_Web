import { useRef, useEffect, useState } from 'react'
import { Send, Smile, Paperclip } from 'lucide-react'
import { useMessagesInfiniteQuery } from '@/features/chat/queries/use-queries'
import { useSendMessageMutation } from '@/features/chat/queries/use-mutations'
import { useAuth } from '@/features/auth'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import type { ConversationResponse } from '@/features/chat/schemas/chat.schema'

export function MiniChatView({ conversation }: { conversation: ConversationResponse }) {
  const { user } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState('')
  
  const { data, fetchNextPage, hasNextPage } = useMessagesInfiniteQuery(conversation.id)
  const { mutate: sendMessage } = useSendMessageMutation()

  const allMessages = data?.pages.flatMap((page) => page.data) || []
  const reversedMessages = [...allMessages].reverse()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [reversedMessages.length])

  const handleSend = () => {
    if (!content.trim()) return
    sendMessage({
      conversationId: conversation.id,
      content: content.trim(),
      recipientId: null
    })
    setContent('')
  }

  return (
    <div className='flex flex-col h-full bg-white dark:bg-zinc-950'>
      {/* Messages */}
      <div 
        ref={scrollRef}
        className='flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 custom-scrollbar'
      >
        {hasNextPage && (
          <button 
            onClick={() => fetchNextPage()}
            className='text-[11px] text-zinc-500 hover:text-primary transition-colors text-center py-2'
          >
            Xem tin nhắn cũ hơn
          </button>
        )}
        
        {reversedMessages.map((msg, index) => {
          const isOwn = msg.senderId === user?.id
          const showAvatar = !isOwn && (index === 0 || reversedMessages[index-1].senderId !== msg.senderId)
          
          return (
            <div 
              key={msg.id} 
              className={cn(
                'flex items-end gap-2',
                isOwn ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {!isOwn && (
                <div className='w-7 shrink-0'>
                  {showAvatar ? (
                    <UserAvatar src={msg.senderAvatar} name={msg.senderName || ''} className='h-7 w-7' />
                  ) : <div className='w-7' />}
                </div>
              )}
              <div className={cn(
                'max-w-[75%] px-3 py-2 rounded-2xl text-[13px] shadow-sm',
                isOwn 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none'
              )}>
                <p className='whitespace-pre-wrap break-words'>{msg.content}</p>
                <span className={cn(
                  'text-[9px] mt-1 block opacity-60 text-right',
                  isOwn ? 'text-white' : 'text-zinc-500'
                )}>
                  {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { locale: vi, addSuffix: true })}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className='p-3 border-t border-zinc-100 dark:border-zinc-800'>
        <div className='flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-1.5'>
          <button className='text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors'>
            <Paperclip className='w-4 h-4' />
          </button>
          <input 
            type='text'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder='Nhắn tin...'
            className='flex-1 bg-transparent border-none outline-none text-[13px] text-zinc-900 dark:text-zinc-100 py-1'
          />
          <button className='text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors'>
            <Smile className='w-4 h-4' />
          </button>
          {content.trim() && (
            <button 
              onClick={handleSend}
              className='text-blue-500 hover:text-blue-600 transition-colors'
            >
              <Send className='w-4 h-4 fill-current' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
