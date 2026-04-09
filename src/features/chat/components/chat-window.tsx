import { Phone, Video, Search, PanelsTopLeft, Users } from 'lucide-react'
import { useMessagesInfiniteQuery } from '../queries/use-queries'
import { useAuth } from '@/features/auth'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useChatText } from '../i18n/use-chat-text'
import { useMarkAsReadMutation } from '../queries/use-mutations'
import { useEffect, useRef, useMemo, useState } from 'react'
import type { ConversationResponse, MessageResponse } from '../schemas/chat.schema'
import { ForwardModal } from './forward-modal'
import { formatLastSeen } from '@/utils/date'
import { CloudInfoSidebar } from './cloud-info-sidebar'
import { AiChatWindow } from './ai-chat-window'
import { StrangerBanner } from './stranger-banner'
import { OthersProfileDialog } from '@/features/user/components/profile-dialog/others/others-profile-dialog'

export function ChatWindow({ conversation }: { conversation: ConversationResponse }) {
  const { user } = useAuth()
  const { text } = useChatText()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessagesInfiniteQuery(conversation.id)

  const { scrollRef, handleScroll } = useChatScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const lastReadSentId = useRef<string | null>(null)

  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null)
  const [forwardingMessage, setForwardingMessage] = useState<MessageResponse | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const allMessages = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data])
  const latestMessageId = allMessages[0]?.id
  const latestMessageSenderId = allMessages[0]?.senderId

  // Cloud = phòng chỉ có 1 member (chính mình), AI = có member ai-assistant-001
  const isCloudConversation = conversation.members?.length === 1 && conversation.members[0]?.userId === user?.id
  const isAiConversation = conversation.members?.some((m) => m.userId === 'ai-assistant-001') ?? false
  const isGroup = conversation.isGroup || false
  const partnerId = conversation.recipientId || conversation.members?.find((m) => m.userId !== user?.id)?.userId

  useEffect(() => {
    if (!latestMessageId || !conversation.id || conversation.unreadCount === 0) return
    if (latestMessageSenderId === user?.id) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && document.visibilityState === 'visible') {
          if (lastReadSentId.current === latestMessageId) return
          lastReadSentId.current = latestMessageId
          markAsRead(conversation.id)
        }
      },
      { threshold: 0.5 }
    )

    const currentRef = lastMessageRef.current
    if (currentRef) observer.observe(currentRef)
    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [latestMessageId, latestMessageSenderId, conversation.id, conversation.unreadCount, markAsRead, user?.id])

  const isSameGroup = (msg1: MessageResponse, msg2: MessageResponse) => {
    if (!msg1 || !msg2) return false
    if (msg1.senderId !== msg2.senderId) return false
    const time1 = new Date(msg1.createdAt || '').getTime()
    const time2 = new Date(msg2.createdAt || '').getTime()
    const diffMinutes = Math.abs(time1 - time2) / (1000 * 60)
    return diffMinutes < 5
  }

  // Render AI chat window riêng biệt
  if (isAiConversation) {
    return (
      <div className='flex-1 flex h-full overflow-hidden'>
        <AiChatWindow conversation={conversation} />
      </div>
    )
  }

  return (
    <div className='flex-1 flex h-full overflow-hidden'>
      <div className='flex-1 flex flex-col bg-[#eef0f1] dark:bg-zinc-950 relative overflow-hidden h-full'>
        {/* Header */}
        <div className='h-[68px] border-b border-border bg-background flex items-center justify-between px-4 shrink-0 shadow-sm z-10'>
          <div
            className={`flex items-center space-x-3 group ${!isGroup && !isCloudConversation ? 'cursor-pointer hover:bg-black/5 p-1.5 -ml-1.5 rounded-lg transition-colors' : ''}`}
            onClick={() => {
              if (!isGroup && !isCloudConversation) {
                setIsProfileOpen(true)
              }
            }}
          >
            <div className='relative shrink-0 hidden sm:block'>
              <img
                src={conversation.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.id}`}
                alt={conversation.name || 'User'}
                className='w-10 h-10 rounded-full object-cover border border-black/5'
              />
              {conversation.status === 'ONLINE' && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full' />
              )}
            </div>
            <div>
              <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight'>
                {isCloudConversation ? 'My Documents' : conversation.name}
              </h2>
              <div className='flex items-center gap-2 mt-0.5 leading-tight'>
                {isCloudConversation ? (
                  <p className='text-[12px] text-muted-foreground'>Lưu và đồng bộ dữ liệu giữa các thiết bị</p>
                ) : !isGroup && (!conversation.friendshipStatus || conversation.friendshipStatus !== 'ACCEPTED') ? (
                  <div className='flex items-center space-x-2'>
                    <span className='bg-[#A6AAB1] text-white text-[10px] font-semibold px-1.5 py-[1px] rounded-[3px] uppercase tracking-wide'>
                      Người lạ
                    </span>
                    <span className='text-muted-foreground'>|</span>
                    <div className='flex items-center text-[12px] text-muted-foreground gap-1 font-medium'>
                      <Users className='w-3.5 h-3.5' />
                      <span>Nhóm chung (0)</span>
                    </div>
                  </div>
                ) : conversation.status === 'ONLINE' ? (
                  <p className='text-[12px] text-muted-foreground'>{text.status.online}</p>
                ) : (
                  <p className='text-[12px] text-muted-foreground'>
                    {formatLastSeen(conversation.lastSeenAt, text.status)}
                  </p>
                )}
              </div>
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

        {/* Stranger Banner */}
        {!isGroup && !isCloudConversation && !isAiConversation && partnerId && (
          <StrangerBanner partnerId={partnerId} partnerName={conversation.name || 'Thành viên Zalo'} />
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className='flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse custom-scrollbar'
        >
          {isLoading && (
            <div className='flex items-center justify-center flex-1 text-sm text-primary py-8'>Đang tải...</div>
          )}

          {allMessages.map((msg, index) => {
            const prevMsg = allMessages[index + 1]
            const nextMsg = allMessages[index - 1]
            const isFirst = !isSameGroup(msg, prevMsg)
            const isLast = !isSameGroup(msg, nextMsg)

            return (
              <div key={msg.id} ref={index === 0 ? lastMessageRef : null}>
                <MessageBubble
                  message={msg}
                  isOwn={msg.senderId === user?.id}
                  isFirst={isFirst}
                  isLast={isLast}
                  isNewest={index === 0}
                  conversation={conversation}
                  onReply={() => setReplyTo(msg)}
                  onForward={() => setForwardingMessage(msg)}
                />
              </div>
            )
          })}

          {isFetchingNextPage && <div className='py-4 text-center text-sm text-muted-foreground'>Đang tải thêm...</div>}
        </div>

        {/* Input */}
        <ChatInput conversationId={conversation.id} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />

        {forwardingMessage && <ForwardModal message={forwardingMessage} onClose={() => setForwardingMessage(null)} />}
      </div>

      {/* Right Sidebar for Cloud / Info */}
      {isCloudConversation && <CloudInfoSidebar />}

      {/* Others Profile Dialog */}
      <OthersProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} userId={partnerId} />
    </div>
  )
}
