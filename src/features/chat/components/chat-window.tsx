import { Fragment } from 'react'
import { Phone, Video, Search, PanelsTopLeft, MoreHorizontal } from 'lucide-react'
import { useMessagesInfiniteQuery } from '../queries/use-queries'
import { useAuth } from '@/features/auth'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useChatText } from '../i18n/use-chat-text'
import type { ConversationResponse, MessageResponse } from '../schemas/chat.schema'

export function ChatWindow({ conversation }: { conversation: ConversationResponse }) {
  const { user } = useAuth()
  const { text } = useChatText()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessagesInfiniteQuery(
    conversation.partnerId
  )

  const { scrollRef, handleScroll } = useChatScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })

  return (
    <div className='flex-1 flex flex-col bg-[#eef0f1] dark:bg-zinc-950 relative overflow-hidden h-full'>
      {/* Header */}
      <div className='h-[68px] border-b border-border bg-background flex items-center justify-between px-4 shrink-0 shadow-sm z-10'>
        <div className='flex items-center space-x-3'>
          <div className='relative shrink-0 hidden sm:block'>
            <img
              src={conversation.partnerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.partnerId}`}
              alt={conversation.partnerName || 'User'}
              className='w-10 h-10 rounded-full object-cover border border-black/5'
            />
            {conversation.partnerStatus === 'ONLINE' && (
              <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full' />
            )}
          </div>
          <div>
            <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight'>
              {conversation.partnerName}
            </h2>
            <p className='text-[12px] text-muted-foreground mt-0.5 leading-tight'>
              {conversation.partnerStatus === 'ONLINE'
                ? text.status.online
                : conversation.lastSeenAt
                ? text.status.lastSeen(
                    new Date(conversation.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  )
                : 'Offline'}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-1 sm:space-x-2 text-muted-foreground'>
          <button className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block'>
            <Phone className='w-[18px] h-[18px]' />
          </button>
          <button className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block'>
            <Video className='w-5 h-5' />
          </button>
          <div className='w-[1px] h-5 bg-border mx-1 hidden sm:block' />
          <button className='p-2 hover:bg-muted rounded-full transition-colors'>
            <Search className='w-[18px] h-[18px]' />
          </button>
          <button className='p-2 hover:bg-muted rounded-full transition-colors hidden md:block'>
            <PanelsTopLeft className='w-[18px] h-[18px]' />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className='flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse custom-scrollbar'
      >
        {isLoading && <div className='flex items-center justify-center flex-1 text-sm text-primary py-8'>Đang tải...</div>}
        
        {data?.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map((msg: MessageResponse) => (
              <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />
            ))}
          </Fragment>
        ))}

        {isFetchingNextPage && (
          <div className='py-4 text-center text-sm text-muted-foreground'>Đang tải thêm...</div>
        )}
      </div>

      {/* Input */}
      <ChatInput recipientId={conversation.partnerId} />
    </div>
  )
}
