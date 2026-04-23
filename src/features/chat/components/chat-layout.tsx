import { useEffect, useMemo, useState } from 'react'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'
import { useChatText } from '../i18n/use-chat-text'
import { useConversationsQuery } from '../queries/use-queries'
import type { ConversationResponse } from '../schemas/chat.schema'
import { useNavigate } from 'react-router'
import { Status } from '@/constants/enum'
import { useUserById } from '@/features/user/queries/use-queries'
import { JoinGroupDialog } from './group/dialogs/join-group-dialog'
import { BONDHUB_AI } from '@/constants/system'
import type { UnreadAnchorResponse } from '../api/chat.api'

interface CapturedUnreadAnchor extends UnreadAnchorResponse {
  conversationId: string
}

export function ChatLayout({
  defaultPartnerId,
  defaultConversationId,
  defaultJoinToken
}: {
  defaultPartnerId?: string
  defaultConversationId?: string
  defaultJoinToken?: string
}) {
  const navigate = useNavigate()
  const { text } = useChatText()

  const [userSelectedChatId, setUserSelectedChatId] = useState<string | null>(null)
  const [currentSnapshotId, setCurrentSnapshotId] = useState<string | null>(null)
  const [capturedUnreadCount, setCapturedUnreadCount] = useState<number>(0)
  const [capturedUnreadAnchor, setCapturedUnreadAnchor] = useState<CapturedUnreadAnchor | null>(null)

  const { data: conversations } = useConversationsQuery()

  // ── Tìm conversation trong cache theo partnerId (member matching) ──
  const cachedConvForPartner = useMemo(() => {
    if (!conversations || !defaultPartnerId) return null
    return (
      conversations.find(
        (c: ConversationResponse) =>
          c.members?.some((m) => m.userId === defaultPartnerId) ||
          c.recipientId === defaultPartnerId ||
          (!c.isGroup && c.name === defaultPartnerId)
      ) || null
    )
  }, [conversations, defaultPartnerId])

  const { data: partnerUser, isLoading: isLoadingPartner } = useUserById(defaultPartnerId || '')

  const resolvedConversation = useMemo<ConversationResponse | null>(() => {
    if (!defaultPartnerId || cachedConvForPartner || isLoadingPartner || !partnerUser) {
      return null
    }

    return {
      id: `fake_${partnerUser.id}`,
      recipientId: partnerUser.id,
      name: partnerUser.fullName,
      avatar: partnerUser.avatar,
      status: Status.Offline,
      friendshipStatus: null,
      isGroup: false,
      isDisbanded: false,
      members: []
    }
  }, [defaultPartnerId, cachedConvForPartner, isLoadingPartner, partnerUser])

  const isResolving = !!defaultPartnerId && !cachedConvForPartner && isLoadingPartner

  useEffect(() => {
    if (!defaultPartnerId || !cachedConvForPartner) return
    navigate(`/chat/c/${cachedConvForPartner.id}`, { replace: true })
  }, [defaultPartnerId, cachedConvForPartner, navigate])

  // ── Tính selectedChatId theo thứ tự ưu tiên ──
  // defaultConversationId (từ URL) được ưu tiên cao nhất để navigate từ bên ngoài (vd: tạo nhóm) hoạt động
  const defaultChatId = cachedConvForPartner?.id || resolvedConversation?.id || null
  const selectedChatId = userSelectedChatId || defaultConversationId || defaultChatId

  useEffect(() => {
    if (!defaultConversationId) return
    setUserSelectedChatId((current) => (current === defaultConversationId ? current : defaultConversationId))
  }, [defaultConversationId])

  const selectedChat = useMemo(() => {
    if (!selectedChatId) return null
    // Tìm trong cache trước
    const fromCache = conversations?.find((c: ConversationResponse) => c.id === selectedChatId)
    if (fromCache) return fromCache
    // Fallback sang resolvedConversation nếu chưa kịp inject vào cache
    if (resolvedConversation?.id === selectedChatId) return resolvedConversation
    return null
  }, [selectedChatId, conversations, resolvedConversation])

  // ── Document title theo unread count ──
  const totalUnread = useMemo(() => {
    if (!conversations) return 0

    return conversations.reduce((sum: number, c: ConversationResponse) => {
      const isAiConversation = c.members?.some((m) => m.userId === BONDHUB_AI.userId) ?? false
      if (isAiConversation) return sum
      return sum + (c.unreadCount || 0)
    }, 0)
  }, [conversations])

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) Tin nhắn mới | Zalo Web` : 'Zalo Web - PC'
  }, [totalUnread])

  const handleClearSnapshot = () => {
    setCurrentSnapshotId(null)
    setCapturedUnreadCount(0)
    setCapturedUnreadAnchor(null)
  }

  return (
    <div className='flex w-full h-full overflow-hidden'>
      <ChatSidebar
        selectedChatId={selectedChatId || undefined}
        onCaptureUnreadAnchor={(conversationId, unreadAnchor) => {
          setCapturedUnreadAnchor({ conversationId, ...unreadAnchor })
        }}
        onSelectChat={(chat: ConversationResponse, snapshotId, unreadCount) => {
          setUserSelectedChatId(chat.id)
          setCurrentSnapshotId(snapshotId || null)
          setCapturedUnreadCount(unreadCount || 0)
          setCapturedUnreadAnchor(null)
          navigate(`/chat/c/${chat.id}`)
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
          <ChatWindow
            conversation={selectedChat}
            snapshotId={currentSnapshotId}
            capturedUnreadCount={capturedUnreadCount}
            capturedUnreadAnchor={capturedUnreadAnchor}
            onClearSnapshot={handleClearSnapshot}
          />
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

      <JoinGroupDialog
        open={!!defaultJoinToken}
        onOpenChange={(open) => {
          if (!open) navigate('/', { replace: true })
        }}
        token={defaultJoinToken || null}
      />
    </div>
  )
}
