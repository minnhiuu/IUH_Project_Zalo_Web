import { useState } from 'react'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'
import { useChatText } from '../i18n/use-chat-text'
import { useConversationsQuery } from '../queries/use-queries'
import { useMarkAsReadMutation } from '../queries/use-mutations'
import * as React from 'react'
import { useEffect } from 'react'
import type { ConversationResponse } from '../schemas/chat.schema'

export function ChatLayout({ defaultPartnerId }: { defaultPartnerId?: string }) {
  const { text } = useChatText()
  const [userSelectedChatId, setUserSelectedChatId] = useState<string | null>(null)
  const { data: conversations } = useConversationsQuery()
  const { mutate: markAsRead } = useMarkAsReadMutation()

  const defaultChatId = React.useMemo(() => {
    if (!conversations || !defaultPartnerId) return null
    return (
      conversations.find((c: ConversationResponse) => c.partnerId === defaultPartnerId)?.conversationId ||
      `${defaultPartnerId}_${defaultPartnerId}`
    )
  }, [conversations, defaultPartnerId])

  const selectedChatId = userSelectedChatId || defaultChatId

  const selectedChat = React.useMemo(() => {
    if (!selectedChatId) return null

    // 1. Find in real conversations
    const found = conversations?.find((c: ConversationResponse) => c.conversationId === selectedChatId)
    if (found) return found

    // 2. Handle mock for "My Documents" (Cloud) if selectedChatId matches
    if (defaultPartnerId && selectedChatId === `${defaultPartnerId}_${defaultPartnerId}`) {
      return {
        conversationId: `${defaultPartnerId}_${defaultPartnerId}`,
        partnerId: defaultPartnerId,
        partnerName: 'My Documents',
        partnerAvatar: null,
        partnerStatus: 'ONLINE',
        lastSeenAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        isLastMessageFromMe: true,
        unreadCount: 0,
        members: []
      } as unknown as ConversationResponse
    }

    return null
  }, [selectedChatId, conversations, defaultPartnerId])

  const totalUnread = React.useMemo(() => {
    if (!conversations) return 0
    return conversations.reduce((sum: number, c: ConversationResponse) => sum + (c.unreadCount || 0), 0)
  }, [conversations])

  useEffect(() => {
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Tin nhắn mới | Zalo Web`
    } else {
      document.title = 'Zalo Web - PC'
    }
  }, [totalUnread])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && selectedChat) {
        const activeConversation = conversations?.find(
          (c: ConversationResponse) => c.conversationId === selectedChat.conversationId
        )
        if (activeConversation && activeConversation.unreadCount && activeConversation.unreadCount > 0) {
          markAsRead(selectedChat.conversationId)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Auto mark as read immediately after opening a new tab or when selected chat updates with unread > 0
    if (document.visibilityState === 'visible' && selectedChat) {
      const activeConversation = conversations?.find(
        (c: ConversationResponse) => c.conversationId === selectedChat.conversationId
      )
      if (activeConversation && activeConversation.unreadCount && activeConversation.unreadCount > 0) {
        markAsRead(selectedChat.conversationId)
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [selectedChat, conversations, markAsRead])

  return (
    <div className='flex w-full h-full overflow-hidden'>
      <ChatSidebar
        selectedChatId={selectedChatId || undefined}
        onSelectChat={(chat: ConversationResponse) => setUserSelectedChatId(chat.conversationId)}
      />

      {(() => {
        const activeConversation = selectedChat
        return activeConversation ? (
          <ChatWindow conversation={activeConversation} />
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center bg-background p-8 text-center'>
            <div className='max-w-[500px] space-y-8 animate-in fade-in zoom-in duration-700'>
              <div className='space-y-4'>
                <h1 className='text-[22px] font-semibold text-foreground/80'>Chào mừng đến với Zalo Web!</h1>
                <p className='text-[15px] text-muted-foreground leading-relaxed px-8'>
                  Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè được tối ưu hoá cho máy
                  tính của bạn.
                </p>
              </div>

              <div className='relative w-full aspect-video flex items-center justify-center'>
                <div className='relative w-full max-w-[320px]'>
                  <img
                    src='https://res.cloudinary.com/dt9vunfbg/image/upload/v1711210427/zalo-welcome_yqjs4d.png'
                    alt='Welcome Illustration'
                    className='w-full h-auto drop-shadow-xl'
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Welcome&backgroundColor=b6e3f4'
                    }}
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <h2 className='text-[18px] font-medium text-primary'>Nhắn tin nhiều hơn, soạn thảo ít hơn</h2>
                <p className='text-[14px] text-muted-foreground'>
                  Sử dụng <span className='font-bold text-foreground/70'>Tin Nhắn Nhanh</span> để lưu sẵn các tin nhắn
                  thường dùng và gửi nhanh trong hội thoại bất kỳ.
                </p>
              </div>

              <p className='text-sm text-muted-foreground pt-4'>{text.emptyState}</p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
