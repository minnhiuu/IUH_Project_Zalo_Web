import { Phone, Video, Search, PanelsTopLeft, Users, Pencil } from 'lucide-react'
import { useMessagesInfiniteQuery, useUnreadAnchorQuery } from '../queries/use-queries'
import { useAuth } from '@/features/auth'
import { useChatContext } from '../context/chat-context'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { ChatInputRestricted } from './chat-input-restricted'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useChatText } from '../i18n/use-chat-text'
import { VideoCallRoom, IncomingCallDialog, OutgoingCallScreen, useVideoCall } from './call-video/video-call'
import { useCallNotification } from '../hooks/use-call-notification'
import { rejectCallApi } from '../api/call.api'
import {
  useMarkAsReadMutation,
  useUpdateGroupNameMutation,
  useUpdateGroupAvatarMutation,
  useSendMessageMutation
} from '../queries/use-mutations'
import { useEffect, useRef, useMemo, useState, useCallback, Fragment } from 'react'
import type { ConversationResponse, MessageResponse } from '../schemas/chat.schema'
import { ForwardDialog } from './forward-dialog'
import { formatLastSeen } from '@/utils/date'
import { CloudInfoSidebar } from './cloud-info-sidebar'
import { AiChatWindow } from './ai-chat-window'
import { ChatInfoSidebar } from './chat-info-sidebar'
import { UserAvatar } from '@/components/common/user-avatar'
import { ActionButton } from '@/components/common/action-button'
import { GroupAvatar } from '@/components/common/group-avatar'
import { ImageCropperDialog } from '@/components/common/image-cropper-dialog'
import { getCroppedImg } from '@/utils/image-crop'
import { cn } from '@/lib/utils'
import { BONDHUB_AI } from '@/constants/system'
import { useAiStreamingStore } from '../hooks/ai-streaming-registry'
import { AiMessageBubble } from './ai-message-bubble'
import { parseAiSuggestions, parseAiQuestion, AI_SUGGESTION_EVENT } from '../utils/ai-parser'
import { GroupIntroCard } from './group/cards/group-intro-card'
import { getConversationDisplayName } from '../utils/group-name'
import { GroupInfoDialog } from './group/dialogs/group-info-dialog'
import { RenameGroupDialog } from './group/dialogs/rename-group-dialog'
import { showLoadingToast, showSuccessToast, showErrorToast, showWarningToast } from '@/utils/toast'
import { toast } from 'sonner'
import { StrangerBanner } from './stranger-banner'
import { OthersProfileDialog } from '@/features/user/components/profile-dialog/others/others-profile-dialog'
import { OwnerProfileDialog } from '@/features/user/components/profile-dialog/owner/owner-profile-dialog'
import { canSendMessages, canChangeGroupInfo } from '../utils/group-permissions'
import { PinBoard } from './pin-board'
import { TypingIndicator } from './typing-indicator'

const OPEN_GROUP_MANAGEMENT_EVENT = 'chat:open-group-management'
const OPEN_GROUP_INFO_EVENT = 'chat:open-group-info'

export function ChatWindow({
  conversation,
  snapshotId,
  capturedUnreadCount,
  onClearSnapshot
}: {
  conversation: ConversationResponse
  snapshotId: string | null
  capturedUnreadCount: number
  onClearSnapshot: () => void
}) {
  const { user } = useAuth()
  const { sendMessage, typingUsers } = useChatContext()
  const { t, text } = useChatText()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessagesInfiniteQuery(conversation.id)

  const suppressFetchRef = useRef(false)
  const { scrollRef, handleScroll, isAtBottom, scrollToBottom } = useChatScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    suppressFetchRef
  })
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const { mutate: sendMsgMutate } = useSendMessageMutation()
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const lastReadSentId = useRef<string | null>(null)

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight-message')
    setTimeout(() => el.classList.remove('highlight-message'), 1200)
  }, [])

  // ΓöÇΓöÇΓöÇ Unread anchor ΓöÇΓöÇΓöÇ
  const { data: unreadAnchor } = useUnreadAnchorQuery(conversation.id)
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null)
  const [unreadDisplayCount, setUnreadDisplayCount] = useState(0)
  const [unreadDividerEl, setUnreadDividerEl] = useState<HTMLDivElement | null>(null)
  const pendingScrollToUnread = useRef(false)
  const anchorInitialized = useRef(false)
  const dividerVisibleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestMessageIdRef = useRef<string | undefined>(undefined)
  const markAsReadRef = useRef(markAsRead)

  // ΓöÇΓöÇΓöÇ New message button state (populated after latestMessageId is known) ΓöÇΓöÇΓöÇ
  const [newMsgCount, setNewMsgCount] = useState(0)
  const prevLatestIdRef = useRef<string | null>(null)

  const scrollToUnread = useCallback(() => {
    if (!firstUnreadId) return
    const el = document.getElementById(`msg-${firstUnreadId}`)
    if (el) {
      suppressFetchRef.current = true
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('highlight-message')
      setTimeout(() => el.classList.remove('highlight-message'), 1200)
      setTimeout(() => {
        suppressFetchRef.current = false
      }, 1500)
    } else if (hasNextPage && !isFetchingNextPage) {
      pendingScrollToUnread.current = true
      fetchNextPage()
    }
  }, [firstUnreadId, fetchNextPage, hasNextPage, isFetchingNextPage])

  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null)
  const [forwardingMessage, setForwardingMessage] = useState<MessageResponse | null>(null)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
  const [infoDialogStep, setInfoDialogStep] = useState<'info' | 'management'>('info')
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(window.innerWidth >= 1150)
  const [managementOpenSignal, setManagementOpenSignal] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isOwnerProfileOpen, setIsOwnerProfileOpen] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | undefined>(undefined)

  // Video Call
  const {
    callState,
    startCall,
    connectCall,
    cancelOutgoing,
    handleIncomingCall,
    acceptIncoming,
    rejectIncoming,
    endCall
  } = useVideoCall()
  const [isCallLoading, setIsCallLoading] = useState(false)

  useCallNotification({ onIncomingCall: handleIncomingCall })

  const handleStartVideoCall = async () => {
    if (!partnerId || isGroup || isCloudConversation) return
    setIsCallLoading(true)
    try {
      await startCall(partnerId)
    } catch (error: unknown) {
      const code = (error as { response?: { data?: { code?: number } } })?.response?.data?.code
      if (code === 5001) {
        showWarningToast(t('call.busy'))
      } else if (code === 5004) {
        showWarningToast(t('call.already_in_call'))
      } else {
        showErrorToast(t('call.error'))
      }
    } finally {
      setIsCallLoading(false)
    }
  }

  const handleRejectIncoming = async () => {
    if (callState.incoming) {
      try {
        await rejectCallApi(callState.incoming.sessionId)
      } catch {
        /* ignore */
      }
    }
    rejectIncoming()
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1150) {
        setIsInfoSidebarOpen(false)
      } else {
        setIsInfoSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleOpenManagement = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>
      if (customEvent.detail?.conversationId !== conversation.id) return
      setIsInfoSidebarOpen(true)
      setManagementOpenSignal((v) => v + 1)
    }

    window.addEventListener(OPEN_GROUP_MANAGEMENT_EVENT, handleOpenManagement as EventListener)
    return () => window.removeEventListener(OPEN_GROUP_MANAGEMENT_EVENT, handleOpenManagement as EventListener)
  }, [conversation.id])

  useEffect(() => {
    const handleOpenInfo = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>
      if (customEvent.detail?.conversationId !== conversation.id) return
      setIsInfoSidebarOpen(true)
    }

    window.addEventListener(OPEN_GROUP_INFO_EVENT, handleOpenInfo as EventListener)
    return () => window.removeEventListener(OPEN_GROUP_INFO_EVENT, handleOpenInfo as EventListener)
  }, [conversation.id])
  const { mutate: updateGroupName, isPending: isUpdatingName } = useUpdateGroupNameMutation()
  const { mutate: updateGroupAvatar } = useUpdateGroupAvatarMutation()

  const [selectedImage, setSelectedImage] = useState<{ url: string; file: File } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setSelectedImage({ url: reader.result as string, file })
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const handleCropConfirm = async (data: { pixels: { x: number; y: number; width: number; height: number } }) => {
    if (!selectedImage) return

    const toastId = showLoadingToast(text.toasts.updating)

    try {
      const croppedBlob = await getCroppedImg(selectedImage.url, data.pixels)
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], 'group-avatar.jpg', { type: 'image/jpeg' })
        updateGroupAvatar(
          { id: conversation.id, file: croppedFile },
          {
            onSuccess: () => {
              toast.dismiss(toastId)
              showSuccessToast(text.toasts.updateAvatarSuccess)
            },
            onError: () => {
              toast.dismiss(toastId)
            }
          }
        )
      } else {
        toast.dismiss(toastId)
      }
      setSelectedImage(null)
    } catch (err) {
      console.error('Crop failed', err)
      toast.dismiss(toastId)
      showErrorToast(text.toasts.updateError)
      setSelectedImage(null)
    }
  }

  const handleRename = (newName: string) => {
    const toastId = showLoadingToast(text.toasts.updating)
    updateGroupName(
      { id: conversation.id, name: newName },
      {
        onSuccess: () => {
          toast.dismiss(toastId)
          setIsRenameDialogOpen(false)
          showSuccessToast(text.toasts.updateNameSuccess)
        },
        onError: () => {
          toast.dismiss(toastId)
        }
      }
    )
  }

  const aiStream = useAiStreamingStore(conversation.id)

  const allMessages = useMemo(() => {
    const rawMessages = data?.pages.flatMap((page) => page.data) || []
    if (aiStream && aiStream.isStreaming) {
      const syntheticMsg = {
        id: aiStream.messageId || `temp-ai-${Date.now()}`,
        senderId: BONDHUB_AI.userId,
        senderName: BONDHUB_AI.fullName,
        senderAvatar: BONDHUB_AI.avatar,
        content: aiStream.content,
        processingStatus: aiStream.processingStatus,
        isStreaming: true,
        type: 'TEXT' as const,
        status: 'NORMAL' as const,
        conversationId: conversation.id,
        createdAt: new Date().toISOString(),
        isFromMe: false
      } as any // ép kiểu để bỏ qua một số field không dùng tới trong preview
      return [syntheticMsg, ...rawMessages]
    }
    return rawMessages
  }, [data, aiStream, conversation.id])

  const latestMessageId = allMessages[0]?.id
  const latestMessageSenderId = allMessages[0]?.senderId

  useEffect(() => {
    latestMessageIdRef.current = latestMessageId
  }, [latestMessageId])
  useEffect(() => {
    markAsReadRef.current = markAsRead
  }, [markAsRead])

  // ΓöÇΓöÇΓöÇ New message button: track new incoming messages while scrolled up ΓöÇΓöÇΓöÇ
  useEffect(() => {
    if (!latestMessageId) return
    if (prevLatestIdRef.current === null) {
      prevLatestIdRef.current = latestMessageId
      return
    }
    if (prevLatestIdRef.current === latestMessageId) return
    prevLatestIdRef.current = latestMessageId
    if (!isAtBottom && latestMessageSenderId !== user?.id) {
      setNewMsgCount((c) => c + 1)
    }
  }, [latestMessageId, latestMessageSenderId, isAtBottom, user?.id])

  const isCloudConversation =
    !conversation.isGroup && (conversation.name === 'My Documents' || (conversation.avatar ?? '').includes('cloud.png'))
  const isAiConversation = conversation.members?.some((m) => m.userId === 'ai-assistant-001') ?? false
  const isCurrentUserRemovedBySystemMessage = useMemo(() => {
    if (!conversation.isGroup || !user?.id) return false

    for (const msg of allMessages) {
      if (msg.type !== 'SYSTEM' || !msg.metadata) continue

      const metadata = msg.metadata as { action?: string; targetIds?: string[] }
      const targetIds = Array.isArray(metadata.targetIds) ? metadata.targetIds.map(String) : []
      const includesMe = targetIds.includes(String(user.id))

      if ((metadata.action === 'REMOVE_MEMBER' || metadata.action === 'BLOCK_MEMBER') && includesMe) return true
      if (metadata.action === 'LEAVE_GROUP' && String(msg.senderId || '') === String(user.id)) return true
      if (
        (metadata.action === 'ADD_MEMBERS' ||
          metadata.action === 'CREATE_GROUP' ||
          metadata.action === 'JOIN_REQUEST_APPROVED') &&
        includesMe
      )
        return false
      if (metadata.action === 'JOIN_BY_LINK' && String(msg.senderId || '') === String(user.id)) return false
    }

    return false
  }, [allMessages, conversation.isGroup, user?.id])
  const isCurrentUserRemovedFromGroup =
    conversation.isGroup &&
    !conversation.isDisbanded &&
    (!(conversation.members || []).some((m) => m.userId === user?.id) || isCurrentUserRemovedBySystemMessage)
  const isGroup = conversation.isGroup || false
  const partnerId = conversation.recipientId || conversation.members?.find((m) => m.userId !== user?.id)?.userId

  useEffect(() => {
    if (isCurrentUserRemovedFromGroup) return
    if (!latestMessageId || !conversation.id || (conversation.unreadCount ?? 0) === 0) return
    // Only handle new incoming messages when there's no unread divider (divider handles its own case)
    if (!latestMessageId || !conversation.id || conversation.unreadCount === 0) return
    if (latestMessageSenderId === user?.id) return
    if (firstUnreadId) return // divider observer will handle markAsRead

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && document.visibilityState === 'visible') {
          if (lastReadSentId.current === latestMessageId) return
          lastReadSentId.current = latestMessageId
          markAsRead({ conversationId: conversation.id, lastReadMessageId: latestMessageId })
        }
      },
      { threshold: 0.5 }
    )

    const currentRef = lastMessageRef.current
    if (currentRef) observer.observe(currentRef)
    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [
    isCurrentUserRemovedFromGroup,
    latestMessageId,
    latestMessageSenderId,
    conversation.id,
    conversation.unreadCount,
    firstUnreadId,
    // conversation.unreadCount ?? 0,
    markAsRead,
    user?.id
  ])

  // ΓöÇΓöÇΓöÇ Reset unread state when switching conversations ΓöÇΓöÇΓöÇ
  useEffect(() => {
    setFirstUnreadId(null)
    setUnreadDisplayCount(0)
    setNewMsgCount(0)
    prevLatestIdRef.current = null
    anchorInitialized.current = false
    pendingScrollToUnread.current = false
    if (dividerVisibleTimerRef.current) {
      clearTimeout(dividerVisibleTimerRef.current)
      dividerVisibleTimerRef.current = null
    }
  }, [conversation.id])

  useEffect(() => {
    if (isAtBottom && newMsgCount > 0) setNewMsgCount(0)
  }, [isAtBottom, newMsgCount])

  // ΓöÇΓöÇΓöÇ Initialise from query ΓÇö only once per conversation ΓöÇΓöÇΓöÇ
  useEffect(() => {
    if (!unreadAnchor || anchorInitialized.current) return
    const anchorId = unreadAnchor.firstUnreadMessageId
    if (!anchorId) {
      anchorInitialized.current = true
      return
    }
    const msgEl = document.getElementById(`msg-${anchorId}`)
    if (!msgEl) {
      // Element not in DOM yet — if the message is already in the loaded list,
      // wait for the next render (effect will re-run via allMessages dependency).
      if (allMessages.some((m) => m.id === anchorId)) return
      // Message not loaded yet (will be fetched) → show divider now.
      anchorInitialized.current = true
      setFirstUnreadId(anchorId)
      setUnreadDisplayCount(unreadAnchor.unreadCount)
      return
    }
    // Element is in the DOM — defer check to after browser layout/paint.
    anchorInitialized.current = true
    const capturedAnchorId = anchorId
    const capturedUnreadCount = unreadAnchor.unreadCount
    requestAnimationFrame(() => {
      const container = scrollRef.current
      const el = document.getElementById(`msg-${capturedAnchorId}`)
      if (container && el) {
        const cr = container.getBoundingClientRect()
        const mr = el.getBoundingClientRect()
        const isInView = mr.bottom > cr.top && mr.top < cr.bottom
        if (isInView) {
          markAsReadRef.current({ conversationId: conversation.id, lastReadMessageId: latestMessageIdRef.current })
          return
        }
      }
      setFirstUnreadId(capturedAnchorId)
      setUnreadDisplayCount(capturedUnreadCount)
    })
  }, [unreadAnchor, conversation.id, scrollRef, allMessages])

  // getBoundingClientRect: debounced markAsRead when divider enters viewport
  const checkDividerVisibility = useCallback(() => {
    if (!unreadDividerEl || !scrollRef.current) return
    const dividerRect = unreadDividerEl.getBoundingClientRect()
    const containerRect = scrollRef.current.getBoundingClientRect()
    const isVisible = dividerRect.bottom > containerRect.top && dividerRect.top < containerRect.bottom
    if (isVisible && document.visibilityState === 'visible') {
      if (!dividerVisibleTimerRef.current) {
        dividerVisibleTimerRef.current = setTimeout(() => {
          markAsReadRef.current({ conversationId: conversation.id, lastReadMessageId: latestMessageIdRef.current })
          setUnreadDisplayCount(0)
          dividerVisibleTimerRef.current = null
        }, 500)
      }
    } else {
      if (dividerVisibleTimerRef.current) {
        clearTimeout(dividerVisibleTimerRef.current)
        dividerVisibleTimerRef.current = null
      }
    }
  }, [unreadDividerEl, scrollRef, conversation.id])

  useEffect(() => {
    if (!unreadDividerEl) return
    requestAnimationFrame(() => checkDividerVisibility())
    return () => {
      if (dividerVisibleTimerRef.current) {
        clearTimeout(dividerVisibleTimerRef.current)
        dividerVisibleTimerRef.current = null
      }
    }
  }, [unreadDividerEl, allMessages, checkDividerVisibility])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !firstUnreadId || !unreadDisplayCount) return
    const onScroll = () => {
      requestAnimationFrame(() => checkDividerVisibility())
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [firstUnreadId, unreadDisplayCount, checkDividerVisibility, scrollRef])

  // ΓöÇΓöÇΓöÇ Retry scroll once pending page loads ΓöÇΓöÇΓöÇ
  useEffect(() => {
    if (!pendingScrollToUnread.current || !firstUnreadId || isFetchingNextPage) return
    const el = document.getElementById(`msg-${firstUnreadId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('highlight-message')
      setTimeout(() => el.classList.remove('highlight-message'), 1200)
      pendingScrollToUnread.current = false
    } else if (hasNextPage) {
      fetchNextPage()
    } else {
      pendingScrollToUnread.current = false
    }
  }, [allMessages.length, isFetchingNextPage, firstUnreadId, hasNextPage, fetchNextPage])

  const isSameGroup = (msg1: MessageResponse, msg2: MessageResponse) => {
    if (!msg1 || !msg2) return false
    if (msg1.type === 'SYSTEM' || msg2.type === 'SYSTEM') return false
    if (msg1.senderId !== msg2.senderId) return false
    const time1 = new Date(msg1.createdAt || '').getTime()
    const time2 = new Date(msg2.createdAt || '').getTime()
    const diffMinutes = Math.abs(time1 - time2) / (1000 * 60)
    return diffMinutes < 5
  }

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
        <div className='h-[68px] border-b border-border bg-background flex items-center justify-between px-4 shrink-0 shadow-sm z-10'>
          <div
            className={cn(
              'flex items-center space-x-3 min-w-0 flex-1',
              !isGroup &&
                !isCloudConversation &&
                'cursor-pointer hover:bg-black/5 p-1.5 -ml-1.5 rounded-lg transition-colors'
            )}
            onClick={() => {
              if (!isGroup && !isCloudConversation) {
                setIsProfileOpen(true)
              }
            }}
          >
            <div className='relative shrink-0 hidden sm:block'>
              <input type='file' ref={fileInputRef} onChange={handleAvatarChange} accept='image/*' className='hidden' />
              <div
                onClick={
                  conversation.isGroup && !isAiConversation
                    ? (e: React.MouseEvent) => {
                        e.stopPropagation()
                        setInfoDialogStep('info')
                        setIsInfoDialogOpen(true)
                      }
                    : undefined
                }
                className={cn(
                  'relative rounded-full transition-all shrink-0',
                  conversation.isGroup && !isAiConversation && 'cursor-pointer hover:ring-2 hover:ring-primary/20'
                )}
              >
                {conversation.isGroup && !conversation.avatar ? (
                  <GroupAvatar
                    avatars={conversation.members?.map((m) => m.avatar) || []}
                    names={conversation.members?.map((m) => m.fullName) || []}
                    count={conversation.members?.length || 0}
                    size='lg'
                  />
                ) : (
                  <UserAvatar
                    src={conversation.avatar}
                    name={getConversationDisplayName(conversation, 'User', undefined, user?.id)}
                    className='w-10 h-10'
                  />
                )}
              </div>
              {conversation.status === 'ONLINE' && !conversation.isGroup && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full' />
              )}
            </div>
            <div className='min-w-0 flex-1 group/header'>
              <div
                role='button'
                aria-disabled={
                  !conversation.isGroup || isCloudConversation || !canChangeGroupInfo(conversation, user?.id || '')
                }
                onClick={(e) => {
                  if (
                    conversation.isGroup &&
                    !isCloudConversation &&
                    canChangeGroupInfo(conversation, user?.id || '')
                  ) {
                    e.stopPropagation()
                    setIsRenameDialogOpen(true)
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 max-w-full group/btn text-left',
                  conversation.isGroup && !isCloudConversation && canChangeGroupInfo(conversation, user?.id || '')
                    ? 'cursor-pointer'
                    : 'cursor-default'
                )}
              >
                <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight overflow-hidden whitespace-nowrap truncate'>
                  {isCloudConversation
                    ? 'My Documents'
                    : getConversationDisplayName(conversation, 'Group', undefined, user?.id)}
                </h2>
                {conversation.isGroup && !isCloudConversation && canChangeGroupInfo(conversation, user?.id || '') && (
                  <div className='opacity-0 group-hover/header:opacity-100 transition-all shrink-0 ml-1'>
                    <ActionButton icon={<Pencil />} size='sm' iconSize='sm' />
                  </div>
                )}
              </div>
              <p className='text-[12px] text-muted-foreground mt-0.5 leading-tight flex items-center gap-1 overflow-hidden whitespace-nowrap'>
                {isCloudConversation ? (
                  text['chat-window'].cloudSyncDesc
                ) : conversation.isGroup ? (
                  <span className='flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors'>
                    <Users className='w-4 h-4' />
                    {text.status.membersCount(conversation.members?.length || 0)}
                  </span>
                ) : !isGroup && (!conversation.friendshipStatus || conversation.friendshipStatus !== 'ACCEPTED') ? (
                  <span className='flex items-center space-x-2'>
                    <span className='bg-[#A6AAB1] text-white text-[10px] font-semibold px-1.5 py-[1px] rounded-[3px] uppercase tracking-wide'>
                      {text['chat-window'].stranger}
                    </span>
                    <span className='text-muted-foreground'>|</span>
                    <span className='flex items-center text-[12px] text-muted-foreground gap-1 font-medium'>
                      <Users className='w-3.5 h-3.5' />
                      <span>{text['chat-window'].commonGroups(0)}</span>
                    </span>
                  </span>
                ) : conversation.status === 'ONLINE' ? (
                  text.status.online
                ) : (
                  formatLastSeen(conversation.lastSeenAt, text.status)
                )}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-1 sm:space-x-2 text-muted-foreground'>
            <button
              onClick={handleStartVideoCall}
              disabled={isCallLoading || isGroup || isCloudConversation || callState.phase !== 'idle'}
              className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block disabled:opacity-40 disabled:cursor-not-allowed'
              title={text['chat-window'].voiceCall}
            >
              <Phone className='w-[18px] h-[18px]' />
            </button>
            <button
              onClick={handleStartVideoCall}
              disabled={isCallLoading || isGroup || isCloudConversation || callState.phase !== 'idle'}
              className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block disabled:opacity-40 disabled:cursor-not-allowed'
              title={text['chat-window'].videoCall}
            >
              <Video className='w-4 h-4' />
            </button>
            <div className='w-px h-5 bg-border mx-1 hidden sm:block' />
            <button className='p-2 hover:bg-muted rounded-full transition-colors'>
              <Search className='w-[18px] h-[18px]' />
            </button>
            <button
              onClick={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)}
              className={cn(
                'p-2 rounded-full transition-colors hidden md:block',
                isInfoSidebarOpen ? 'bg-blue-50 text-primary hover:bg-blue-100' : 'hover:bg-muted'
              )}
            >
              <PanelsTopLeft className='w-[18px] h-[18px]' />
            </button>
          </div>
        </div>

        {/* Stranger Banner */}
        {!isGroup && !isCloudConversation && !isAiConversation && partnerId && (
          <StrangerBanner partnerId={partnerId} partnerName={conversation.name || text['chat-window'].zaloMember} />
        )}

        {/* Pin Board & Messages Wrapper */}
        <div className='flex-1 relative flex flex-col min-h-0'>
          {/* Pin Board */}
          {!isCloudConversation && !isAiConversation && (
            <PinBoard conversationId={conversation.id} onScrollToMessage={scrollToMessage} />
          )}

          {/* Floating Unread Button */}
          {firstUnreadId && unreadDisplayCount > 0 && (
            <div className='absolute top-4 right-4 z-20'>
              <button
                type='button'
                onClick={scrollToUnread}
                className='relative flex flex-col items-center justify-center w-11 h-11 bg-white dark:bg-zinc-800 border border-border rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-5 h-5 text-foreground'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='17 11 12 6 7 11' />
                  <polyline points='17 18 12 13 7 18' />
                </svg>
                <span className='absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full leading-none'>
                  {unreadDisplayCount > 99 ? '99+' : unreadDisplayCount}
                </span>
              </button>
            </div>
          )}

          {/* Scroll-to-bottom button ΓÇö new incoming messages while scrolled up */}
          {!isAtBottom && newMsgCount > 0 && (
            <div className='absolute bottom-4 right-4 z-20'>
              <button
                type='button'
                onClick={() => {
                  scrollToBottom()
                  setNewMsgCount(0)
                }}
                className='relative flex flex-col items-center justify-center w-11 h-11 bg-white dark:bg-zinc-800 border border-border rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-5 h-5 text-foreground'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='7 13 12 18 17 13' />
                  <polyline points='7 6 12 11 17 6' />
                </svg>
                <span className='absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full leading-none'>
                  {newMsgCount > 99 ? '99+' : newMsgCount}
                </span>
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className='flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse custom-scrollbar'
          >
            {isLoading && (
              <div className='flex items-center justify-center flex-1 text-sm text-primary py-8'>{text.loading}</div>
            )}
            {allMessages.map((msg, index) => {
              const prevMsg = allMessages[index + 1]
              const nextMsg = allMessages[index - 1]
              const isFirst = !isSameGroup(msg, prevMsg)
              const isLast = !isSameGroup(msg, nextMsg)
              const isNewestVisible = index === 0

              const isAiMessage = msg.senderId === BONDHUB_AI.userId && msg.type !== 'SYSTEM'

              if (isAiMessage) {
                const { cleanContent, suggestions } = parseAiSuggestions(msg.content)
                const { cleanContent: finalContent, isClarification } = parseAiQuestion(cleanContent)

                const aiMsg = {
                  id: msg.id,
                  role: 'ai' as const,
                  content: finalContent,
                  suggestions,
                  isClarification,
                  isStreaming: !!msg.isStreaming, // from synthetic msg
                  processingStatus: msg.processingStatus, // from synthetic msg
                  timestamp: new Date(msg.createdAt)
                }

                return (
                  <div key={msg.id} id={`msg-${msg.id}`} ref={isNewestVisible ? lastMessageRef : null}>
                    <AiMessageBubble
                      msg={aiMsg}
                      avatarUrl={msg.senderAvatar || BONDHUB_AI.avatar}
                      isLoading={false}
                      onSuggestionClick={(text) => {
                        window.dispatchEvent(new CustomEvent(AI_SUGGESTION_EVENT, { detail: { text } }))
                      }}
                    />
                  </div>
                )
              }

              return (
                <Fragment key={msg.id}>
                  <div id={`msg-${msg.id}`} ref={isNewestVisible ? lastMessageRef : null}>
                    <MessageBubble
                      message={msg}
                      isOwn={msg.senderId === user?.id}
                      isFirst={isFirst}
                      isLast={isLast}
                      isNewest={isNewestVisible}
                      conversation={conversation}
                      onReply={() => setReplyTo(msg)}
                      onForward={() => setForwardingMessage(msg)}
                      onScrollToMessage={scrollToMessage}
                      onAvatarClick={(userId) => {
                        if (userId === user?.id) {
                          setIsOwnerProfileOpen(true)
                        } else {
                          setProfileUserId(userId)
                          setIsProfileOpen(true)
                        }
                      }}
                      onRecall={() => handleStartVideoCall()}
                    />
                  </div>
                  {msg.id === firstUnreadId && (
                    <div
                      ref={setUnreadDividerEl}
                      className='flex items-center gap-2 px-2 py-0 my-0 select-none pointer-events-none'
                    >
                      <div className='flex-1 h-0 border-t border-(--accent-blue-border)' />
                      <span
                        className='text-[11px] font-semibold whitespace-nowrap px-3 py-px rounded-[26px]'
                        style={{ color: 'var(--accent-blue-text)', background: 'var(--bg-message-info)' }}
                      >
                        {text['chat-window'].unreadMessages}
                      </span>
                      <div className='flex-1 h-0 border-t border-(--accent-blue-border)' />
                    </div>
                  )}
                </Fragment>
              )
            })}
            {isFetchingNextPage && <div className='py-4 text-center text-sm text-muted-foreground'>{text.loading}</div>}
            {conversation.isGroup &&
              !conversation.isDisbanded &&
              !isCurrentUserRemovedFromGroup &&
              !hasNextPage &&
              !isFetchingNextPage && (
                <GroupIntroCard
                  conversationId={conversation.id}
                  groupTitle={getConversationDisplayName(
                    conversation,
                    text['group-info-dialog'].title,
                    undefined,
                    user?.id
                  )}
                  groupMembers={(conversation.members || []).map((m) => ({
                    id: m.userId,
                    avatar: m.avatar,
                    name: m.fullName
                  }))}
                  targetAvatars={[]}
                  secondaryLabel={null}
                  t={t}
                />
              )}
          </div>
          <TypingIndicator typingUsers={typingUsers.filter((u) => u.conversationId === conversation.id)} />
        </div>

        {conversation.isDisbanded || isCurrentUserRemovedFromGroup ? (
          <ChatInputRestricted message={text.disbanded.cannotSendMessage} />
        ) : !canSendMessages(conversation, user?.id || '') ? (
          <ChatInputRestricted message={text.restricted.onlyAdminCanSend} highlightTags />
        ) : (
          <ChatInput
            conversationId={conversation.id}
            isGroup={conversation.isGroup}
            replyTo={replyTo}
            unreadCount={capturedUnreadCount}
            snapshotId={snapshotId}
            onCancelReply={() => setReplyTo(null)}
            onClearSnapshot={onClearSnapshot}
          />
        )}
        {forwardingMessage && (
          <ForwardDialog
            open
            message={forwardingMessage}
            onClose={() => setForwardingMessage(null)}
            onConfirm={(selectedConvIds, description) => {
              selectedConvIds.forEach((convId) => {
                const isFake = convId.startsWith('fake_')
                const hasAttachments = (forwardingMessage.attachments?.length ?? 0) > 0
                const finalContent = description
                  ? `${forwardingMessage.content || ''}\n---\n${description}`.trim()
                  : forwardingMessage.content || ''
                if (hasAttachments) {
                  sendMsgMutate({
                    conversationId: isFake ? null : convId,
                    recipientId: isFake ? convId.replace('fake_', '') : null,
                    content: finalContent,
                    isForwarded: true,
                    attachments: forwardingMessage.attachments!.map((a) => ({
                      key: a.key,
                      url: a.url,
                      fileName: a.fileName,
                      originalFileName: a.originalFileName,
                      contentType: a.contentType,
                      size: a.size
                    }))
                  })
                } else {
                  sendMessage(convId, finalContent, null, true)
                }
              })
            }}
          />
        )}

        <RenameGroupDialog
          key={`${conversation.id}-${isRenameDialogOpen}`}
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          conversation={conversation}
          currentUserId={user?.id}
          onConfirm={handleRename}
          isPending={isUpdatingName}
        />
      </div>

      {isInfoSidebarOpen && !isInfoDialogOpen && (
        <div
          className='absolute inset-0 bg-transparent z-[35] min-[1150px]:hidden animate-in fade-in duration-200 cursor-pointer'
          onClick={() => setIsInfoSidebarOpen(false)}
        />
      )}

      {isCloudConversation ? (
        <CloudInfoSidebar />
      ) : isInfoDialogOpen ? (
        <GroupInfoDialog
          conversation={conversation}
          currentUserId={user?.id}
          open={isInfoDialogOpen}
          onOpenChange={setIsInfoDialogOpen}
          initialStep={infoDialogStep}
          onRenameClick={() => {
            setIsInfoDialogOpen(false)
            setIsRenameDialogOpen(true)
          }}
          onAvatarClick={triggerFileInput}
        />
      ) : (
        isInfoSidebarOpen && (
          <div
            className={cn(
              'h-full pointer-events-auto z-[40] bg-background w-87.5 shrink-0 border-l border-border',
              window.innerWidth < 1150 ? 'absolute top-0 right-0 shadow-2xl overflow-hidden' : 'relative'
            )}
          >
            <ChatInfoSidebar
              conversation={conversation}
              onRenameClick={() => setIsRenameDialogOpen(true)}
              onAvatarClick={triggerFileInput}
              managementOpenSignal={managementOpenSignal}
            />
          </div>
        )
      )}

      {selectedImage && (
        <ImageCropperDialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
          image={selectedImage.url}
          title={text['create-group-dialog'].updateAvatarTitle}
          confirmText={text['create-group-dialog'].confirm}
          cancelText={text['create-group-dialog'].cancel}
          dragToMoveText={text['create-group-dialog'].dragToMove}
          onConfirm={handleCropConfirm}
        />
      )}

      {/* Others Profile Dialog */}
      <OthersProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} userId={profileUserId || partnerId} />
      <OwnerProfileDialog open={isOwnerProfileOpen} onOpenChange={setIsOwnerProfileOpen} />

      {/* Video Call Overlays */}
      {callState.phase === 'ringing' && callState.callData && (
        <OutgoingCallScreen callData={callState.callData} onCancel={cancelOutgoing} onConnect={connectCall} />
      )}

      {callState.phase === 'active' && callState.callData && (
        <VideoCallRoom callData={callState.callData} onCallEnd={endCall} />
      )}

      {callState.incoming && (
        <IncomingCallDialog
          callerName={callState.incoming.callerName}
          callerAvatar={callState.incoming.callerAvatar}
          sessionId={callState.incoming.sessionId}
          onAccept={acceptIncoming}
          onReject={handleRejectIncoming}
        />
      )}
    </div>
  )
}
