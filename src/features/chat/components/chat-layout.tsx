import { useState, useEffect } from 'react'
import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'
import { useChatText } from '../i18n/use-chat-text'
import { useConversationsQuery } from '../queries/use-queries'
import { useMarkAsReadMutation } from '../queries/use-mutations'
import { getOrCreateConversation } from '../api/chat.api'
import { chatKeys } from '../queries/keys'
import type { ConversationResponse } from '../schemas/chat.schema'

export function ChatLayout({ defaultPartnerId }: { defaultPartnerId?: string }) {
  const { text } = useChatText()
  const queryClient = useQueryClient()

  const [userSelectedChatId, setUserSelectedChatId] = useState<string | null>(null)
  // Conversation được resolve từ getOrCreateConversation khi defaultPartnerId không có trong cache
  const [resolvedConversation, setResolvedConversation] = useState<ConversationResponse | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  const { data: conversations } = useConversationsQuery()
  const { mutate: markAsRead } = useMarkAsReadMutation()

  // ── Tìm conversation trong cache theo partnerId (member matching) ──
  const cachedConvForPartner = React.useMemo(() => {
    if (!conversations || !defaultPartnerId) return null
    return (
      conversations.find((c: ConversationResponse) => c.members?.some((m) => m.userId === defaultPartnerId)) || null
    )
  }, [conversations, defaultPartnerId])

  // ── Khi có defaultPartnerId nhưng chưa có trong cache → gọi API getOrCreate ──
  useEffect(() => {
    if (!defaultPartnerId) return
    // Nếu đã có trong cache thì không cần gọi API
    if (cachedConvForPartner) {
      setResolvedConversation(cachedConvForPartner)
      return
    }

    let cancelled = false
    setIsResolving(true)
    getOrCreateConversation(defaultPartnerId)
      .then((conv) => {
        if (cancelled) return
        setResolvedConversation(conv)
        // Inject vào conversations cache nếu chưa có
        queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
          if (!oldData) return [conv]
          const exists = oldData.find((c) => c.id === conv.id)
          return exists ? oldData : [conv, ...oldData]
        })
      })
      .catch((err) => {
        console.error('[ChatLayout] Failed to get/create conversation:', err)
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [defaultPartnerId, cachedConvForPartner, queryClient])

  // ── Tính selectedChatId theo thứ tự ưu tiên ──
  const defaultChatId = cachedConvForPartner?.id || resolvedConversation?.id || null
  const selectedChatId = userSelectedChatId || defaultChatId

  const selectedChat = React.useMemo(() => {
    if (!selectedChatId) return null
    // Tìm trong cache trước
    const fromCache = conversations?.find((c: ConversationResponse) => c.id === selectedChatId)
    if (fromCache) return fromCache
    // Fallback sang resolvedConversation nếu chưa kịp inject vào cache
    if (resolvedConversation?.id === selectedChatId) return resolvedConversation
    return null
  }, [selectedChatId, conversations, resolvedConversation])

  // ── Document title theo unread count ──
  const totalUnread = React.useMemo(() => {
    if (!conversations) return 0
    return conversations.reduce((sum: number, c: ConversationResponse) => sum + (c.unreadCount || 0), 0)
  }, [conversations])

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) Tin nhắn mới | Zalo Web` : 'Zalo Web - PC'
  }, [totalUnread])

  // ── Auto mark-as-read khi mở / tab visible ──
  useEffect(() => {
    const tryMarkRead = () => {
      if (document.visibilityState === 'visible' && selectedChat) {
        const activeConv = conversations?.find((c: ConversationResponse) => c.id === selectedChat.id)
        if (activeConv && activeConv.unreadCount && activeConv.unreadCount > 0) {
          markAsRead(selectedChat.id)
        }
      }
    }

    document.addEventListener('visibilitychange', tryMarkRead)
    tryMarkRead() // run immediately on mount / conversation change

    return () => document.removeEventListener('visibilitychange', tryMarkRead)
  }, [selectedChat, conversations, markAsRead])

  return (
    <div className='flex w-full h-full overflow-hidden'>
      <ChatSidebar
        selectedChatId={selectedChatId || undefined}
        onSelectChat={(chat: ConversationResponse) => {
          setUserSelectedChatId(chat.id)
          setResolvedConversation(null) // clear resolved khi user chủ động chọn
        }}
      />

      {(() => {
        if (isResolving && !selectedChat) {
          return (
            <div className='flex-1 flex items-center justify-center bg-background'>
              <div className='text-muted-foreground text-sm animate-pulse'>Đang mở cuộc trò chuyện...</div>
            </div>
          )
        }

        return selectedChat ? (
          <ChatWindow conversation={selectedChat} />
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
