import { Phone, Video, Search, PanelsTopLeft, Users, Pencil } from 'lucide-react'
import { useMessagesInfiniteQuery } from '../queries/use-queries'
import { useAuth } from '@/features/auth'
import { useChatContext } from '../context/chat-context'
import { useQueryClient } from '@tanstack/react-query'
import { chatKeys } from '../queries/keys'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { ChatInputRestricted } from './chat-input-restricted'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useChatText } from '../i18n/use-chat-text'
import { VideoCallRoom, IncomingCallDialog, OutgoingCallScreen, useVideoCall } from './call-video/video-call'
import { GroupCallRoom, GroupCallConfigScreen, GroupIncomingCallDialog, useGroupCall } from './call-video/group-call'
import { useCallNotification } from '../hooks/use-call-notification'
import { rejectCallApi } from '../api/call.api'
import { type UnreadAnchorResponse } from '../api/chat.api'
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
import { SearchSidebar } from './search-message'
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
  capturedUnreadAnchor,
  onClearSnapshot
}: {
  conversation: ConversationResponse
  snapshotId: string | null
  capturedUnreadCount: number
  capturedUnreadAnchor: (UnreadAnchorResponse & { conversationId: string }) | null
  onClearSnapshot: () => void
}) {
  const { user } = useAuth()
  const { sendMessage, typingUsers } = useChatContext()
  const { t, text } = useChatText()
  const queryClient = useQueryClient()
  const [jumpTargetId, setJumpTargetId] = useState<string | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isLoading,
    isFetching
  } = useMessagesInfiniteQuery(conversation.id, jumpTargetId)

  const suppressFetchRef = useRef(false)
  const { scrollRef, handleScroll, scrollToBottom, resetToBottom } = useChatScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    suppressFetchRef
  })
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const { mutate: sendMsgMutate } = useSendMessageMutation()
  const bottomSentinelRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const lastReadSentId = useRef<string | null>(null)
  const newMsgClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isBottomSentinelVisible, setIsBottomSentinelVisible] = useState(true)

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight-message')
    setTimeout(() => el.classList.remove('highlight-message'), 2000)
  }, [])

  const jumpToMessage = useCallback(
    (messageId: string) => {
      const el = document.getElementById(`msg-${messageId}`)
      if (el) {
        scrollToMessage(messageId)
      } else {
        setJumpTargetId(messageId)
        // Ensure UI perceives this as a brand new fetch cycle logic-wise
        queryClient.removeQueries({ queryKey: chatKeys.messages(conversation.id) })
        // React Query will automatically mount and fetch again since the component is still mounted
        // and its active query was removed. It will use the NEW initialPageParam with jumpTargetId.
      }
    },
    [conversation.id, queryClient, scrollToMessage]
  )

  useEffect(() => {
    if (jumpTargetId && !isFetching) {
      const el = document.getElementById(`msg-${jumpTargetId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('highlight-message')
        setTimeout(() => {
          el.classList.remove('highlight-message')
          setJumpTargetId(null)
        }, 2000)
      }
    }
  }, [data, isFetching, jumpTargetId])

  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null)
  const [unreadDisplayCount, setUnreadDisplayCount] = useState(0)
  const [unreadDividerEl, setUnreadDividerEl] = useState<HTMLDivElement | null>(null)
  const pendingScrollToUnread = useRef(false)
  const anchorInitialized = useRef(false)
  const dividerVisibleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestMessageIdRef = useRef<string | undefined>(undefined)
  const markAsReadRef = useRef(markAsRead)
  const initialUnreadCutoffRef = useRef<string | null>(conversation.lastMessage?.timestamp ?? null)
  const [initialUnreadCount, setInitialUnreadCount] = useState(capturedUnreadCount)
  const [, setVisibleInitialUnreadCount] = useState(0)
  const [visibleLoadedUnreadCount, setVisibleLoadedUnreadCount] = useState(0)
  const [unreadUiReady, setUnreadUiReady] = useState(capturedUnreadCount <= 0)
  const [floatingUnreadReady, setFloatingUnreadReady] = useState(capturedUnreadCount <= 0)
  const [isUnreadDividerVisible, setIsUnreadDividerVisible] = useState(false)
  const [deferredUiReady, setDeferredUiReady] = useState(false)
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false)
  const seenInitialUnreadIdsRef = useRef<Set<string>>(new Set())
  const seenLoadedUnreadIdsRef = useRef<Set<string>>(new Set())

  // Bottom button state
  const [newMsgCount, setNewMsgCount] = useState(0)

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
  const [isSearchSidebarOpen, setIsSearchSidebarOpen] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | undefined>(undefined)

  // Jump-to-message from search results
  const [jumpTargetMessageId, setJumpTargetMessageId] = useState<string | null>(null)
  const [highlightKeyword, setHighlightKeyword] = useState<string | null>(null)
  const pendingJumpRef = useRef(false)

  const navigateToMessage = useCallback(
    (convId: string, msgId: string, keyword: string) => {
      setHighlightKeyword(keyword)
      // Step 1: scroll immediately if the message is already rendered.
      const el = document.getElementById(`msg-${msgId}`)
      if (el) {
        setJumpTargetMessageId(msgId)
        return
      }

      // Step 2: Use V2 API to jump directly to the message's page
      setJumpTargetId(msgId)
      setJumpTargetMessageId(msgId)
      pendingJumpRef.current = true
      queryClient.removeQueries({ queryKey: chatKeys.messages(convId) })
    },
    [queryClient]
  )

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

  // Group Call
  const {
    groupCallState,
    startGroupCall,
    endGroupCall
  } = useGroupCall()

  const [incomingGroupCall, setIncomingGroupCall] = useState<{
    roomId: string
    callerName: string
    callerAvatar: string
    callKind: 'voice' | 'video'
    groupName: string
  } | null>(null)

  const handleStartGroupCall = (kind: 'voice' | 'video') => {
    const roomId = `group-call-${conversation.id}`
    const payload = {
      roomId,
      callKind: kind,
      status: 'active' as const,
      callerName: user?.fullName || 'Thành viên'
    }
    sendMessage(conversation.id, `[GROUP_CALL]::${JSON.stringify(payload)}`)
    startGroupCall(roomId, kind)
  }

  const handleJoinGroupCall = useCallback((roomId: string, callKind: 'voice' | 'video') => {
    startGroupCall(roomId, callKind)
  }, [startGroupCall])

  const handleEndGroupCall = useCallback((isLastUser: boolean) => {
    if (isLastUser && groupCallState.roomId) {
      const payload = {
        roomId: groupCallState.roomId,
        callKind: groupCallState.callKind,
        status: 'ended' as const,
        callerName: user?.fullName || 'Thành viên'
      }
      sendMessage(conversation.id, `[GROUP_CALL]::${JSON.stringify(payload)}`)
    }
    endGroupCall()
  }, [conversation.id, groupCallState.roomId, groupCallState.callKind, user, sendMessage, endGroupCall])

  const handleAcceptGroupCall = useCallback((roomId: string, callKind: 'voice' | 'video') => {
    setIncomingGroupCall(null)
    handleJoinGroupCall(roomId, callKind)
  }, [handleJoinGroupCall])

  const handleRejectGroupCall = useCallback(() => {
    setIncomingGroupCall(null)
  }, [])

  // Listen to incoming-group-call WebSocket events
  useEffect(() => {
    const handleIncomingGroupCallEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        roomId: string
        callerName: string
        callerAvatar: string
        callKind: 'voice' | 'video'
        groupName: string
        conversationId: string
      }
      // Ring only if user is completely idle in any calling context
      if (callState.phase === 'idle' && groupCallState.phase === 'idle' && !incomingGroupCall) {
        setIncomingGroupCall({
          roomId: detail.roomId,
          callerName: detail.callerName,
          callerAvatar: detail.callerAvatar,
          callKind: detail.callKind,
          groupName: detail.groupName
        })
      }
    }

    window.addEventListener('incoming-group-call', handleIncomingGroupCallEvent)
    return () => window.removeEventListener('incoming-group-call', handleIncomingGroupCallEvent)
  }, [callState.phase, groupCallState.phase, incomingGroupCall])

  useCallNotification({ onIncomingCall: handleIncomingCall })

  const handleStartCall = async (kind: 'voice' | 'video') => {
    if (!partnerId || isGroup || isCloudConversation) return
    setIsCallLoading(true)
    try {
      await startCall(partnerId, kind)
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

  const handleStartVideoCall = () => {
    if (isGroup) {
      handleStartGroupCall('video')
    } else {
      handleStartCall('video')
    }
  }

  const handleStartVoiceCall = () => {
    if (isGroup) {
      handleStartGroupCall('voice')
    } else {
      handleStartCall('voice')
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

  useEffect(() => {
    if (isSearchSidebarOpen) {
      setIsInfoSidebarOpen(false)
    }
  }, [isSearchSidebarOpen])

  useEffect(() => {
    if (isInfoSidebarOpen) {
      setIsSearchSidebarOpen(false)
    }
  }, [isInfoSidebarOpen])
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
      } as any // Synthetic AI preview message
      return [syntheticMsg, ...rawMessages]
    }
    return rawMessages
  }, [data, aiStream, conversation.id])

  const activeGroupCall = useMemo(() => {
    const latestGroupCallMsg = allMessages.find((m) => m.content?.startsWith('[GROUP_CALL]::'))
    if (!latestGroupCallMsg) return null
    try {
      const payload = JSON.parse(latestGroupCallMsg.content!.slice('[GROUP_CALL]::'.length))
      if (payload.status === 'active') {
        return {
          roomId: payload.roomId,
          callKind: payload.callKind,
          callerName: payload.callerName,
          messageId: latestGroupCallMsg.id
        }
      }
    } catch {
      // ignore
    }
    return null
  }, [allMessages])

  // Automatically dismiss ringing dialogue if the active group call finishes/ends
  useEffect(() => {
    if (incomingGroupCall && !activeGroupCall) {
      setIncomingGroupCall(null)
    }
  }, [activeGroupCall, incomingGroupCall])

  const latestMessageId = allMessages[0]?.id
  const latestMessageSenderId = allMessages[0]?.senderId

  useEffect(() => {
    latestMessageIdRef.current = latestMessageId
  }, [latestMessageId])

  // Accumulate newMsgCount instantly via custom DOM event from WebSocket handler.
  // Using refs avoids stale closures and skips the React re-render pipeline entirely.
  const isBottomSentinelVisibleRef = useRef(isBottomSentinelVisible)
  isBottomSentinelVisibleRef.current = isBottomSentinelVisible
  const userIdRef = useRef(user?.id)
  userIdRef.current = user?.id
  const conversationIdRef = useRef(conversation.id)
  conversationIdRef.current = conversation.id

  useEffect(() => {
    const seenMsgIds = new Set<string>()
    const handler = (e: Event) => {
      const { conversationId: incomingConvId, messageId, senderId } = (e as CustomEvent).detail
      // Only count messages for the currently active conversation
      if (incomingConvId !== conversationIdRef.current) return
      // Don't count own messages
      if (senderId === userIdRef.current) return
      // Deduplicate: each message ID is counted at most once
      if (seenMsgIds.has(messageId)) return
      seenMsgIds.add(messageId)
      // Only accumulate when user is scrolled up
      if (!isBottomSentinelVisibleRef.current) {
        setNewMsgCount((prev) => prev + 1)
      }
    }
    window.addEventListener('chat:incoming-message', handler)
    return () => {
      window.removeEventListener('chat:incoming-message', handler)
      seenMsgIds.clear()
    }
  }, [conversation.id]) // re-subscribe + clear seen set when conversation changes
  useEffect(() => {
    markAsReadRef.current = markAsRead
  }, [markAsRead])

  useEffect(() => {
    const container = scrollRef.current
    const bottomSentinelEl = bottomSentinelRef.current

    if (!container || !bottomSentinelEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        setIsBottomSentinelVisible(entries[0]?.isIntersecting ?? false)
      },
      {
        root: container,
        threshold: 0.6
      }
    )

    observer.observe(bottomSentinelEl)
    return () => observer.disconnect()
  }, [conversation.id, latestMessageId, scrollRef])

  const initialUnreadMessageIds = useMemo(() => {
    if (initialUnreadCount <= 0) return []

    const cutoffTime = initialUnreadCutoffRef.current
      ? new Date(initialUnreadCutoffRef.current).getTime()
      : Number.POSITIVE_INFINITY

    return allMessages
      .filter((msg) => {
        if (!msg.createdAt) return true
        return new Date(msg.createdAt).getTime() <= cutoffTime
      })
      .slice(0, initialUnreadCount)
      .map((msg) => msg.id)
  }, [allMessages, initialUnreadCount, conversation.id])
  const loadedMessageIdSet = useMemo(() => new Set(allMessages.map((msg) => msg.id)), [allMessages])

  const measureVisibleMessageIds = useCallback(
    (messageIds: string[]) => {
      const container = scrollRef.current
      if (!container || messageIds.length === 0) {
        return { visibleIds: [] as string[], missingCount: 0 }
      }

      const containerRect = container.getBoundingClientRect()
      return messageIds.reduce(
        (acc, messageId) => {
          const messageLoaded = loadedMessageIdSet.has(messageId)
          const el = document.getElementById(`msg-${messageId}`)
          if (!el) {
            if (messageLoaded) acc.missingCount += 1
            return acc
          }

          const rect = el.getBoundingClientRect()
          const isVisible = rect.bottom > containerRect.top && rect.top < containerRect.bottom
          if (isVisible) acc.visibleIds.push(messageId)
          return acc
        },
        { visibleIds: [] as string[], missingCount: 0 }
      )
    },
    [loadedMessageIdSet, scrollRef]
  )

  const initializeUnreadUi = useCallback(
    (anchorId: string, totalUnread: number, retry = 0) => {
      const container = scrollRef.current
      const el = document.getElementById(`msg-${anchorId}`)
      const anchorLoaded = allMessages.some((msg) => msg.id === anchorId)
      const hasAnyLoadedMessages = allMessages.length > 0

      if (!hasAnyLoadedMessages && totalUnread > 0 && retry < 8) {
        requestAnimationFrame(() => initializeUnreadUi(anchorId, totalUnread, retry + 1))
        return
      }

      if (anchorLoaded && !el && retry < 8) {
        requestAnimationFrame(() => initializeUnreadUi(anchorId, totalUnread, retry + 1))
        return
      }

      if (container && el) {
        const cr = container.getBoundingClientRect()
        const mr = el.getBoundingClientRect()
        const isInView = mr.bottom > cr.top && mr.top < cr.bottom
        if (isInView) {
          if (lastReadSentId.current !== latestMessageIdRef.current) {
            lastReadSentId.current = latestMessageIdRef.current ?? null
            markAsReadRef.current({ conversationId: conversation.id, lastReadMessageId: latestMessageIdRef.current })
          }
          setFloatingUnreadReady(true)
          setUnreadUiReady(true)
          return
        }
      }

      const firstUnreadIndex = allMessages.findIndex((msg) => msg.id === anchorId)
      let unreadIds: string[] = []
      if (firstUnreadIndex >= 0) {
        const startIndex = Math.max(0, firstUnreadIndex - totalUnread + 1)
        unreadIds = allMessages.slice(startIndex, firstUnreadIndex + 1).map((msg) => msg.id)
      } else {
        unreadIds = allMessages.slice(0, totalUnread).map((msg) => msg.id)
      }

      if (unreadIds.length === 0 && totalUnread > 0 && retry < 8) {
        requestAnimationFrame(() => initializeUnreadUi(anchorId, totalUnread, retry + 1))
        return
      }

      const loadedUnreadMeasurement = measureVisibleMessageIds(unreadIds)
      const initialUnreadMeasurement = measureVisibleMessageIds(initialUnreadMessageIds)

      if ((loadedUnreadMeasurement.missingCount > 0 || initialUnreadMeasurement.missingCount > 0) && retry < 8) {
        requestAnimationFrame(() => initializeUnreadUi(anchorId, totalUnread, retry + 1))
        return
      }

      loadedUnreadMeasurement.visibleIds.forEach((id) => seenLoadedUnreadIdsRef.current.add(id))
      initialUnreadMeasurement.visibleIds.forEach((id) => seenInitialUnreadIdsRef.current.add(id))

      setVisibleLoadedUnreadCount(seenLoadedUnreadIdsRef.current.size)
      setVisibleInitialUnreadCount(seenInitialUnreadIdsRef.current.size)
      setFirstUnreadId(anchorId)
      setUnreadDisplayCount(totalUnread)
      setFloatingUnreadReady(true)
      setUnreadUiReady(true)
    },
    [allMessages, conversation.id, initialUnreadMessageIds, measureVisibleMessageIds]
  )

  const syncVisibleInitialUnreadCount = useCallback(() => {
    if (initialUnreadCount <= 0 || initialUnreadMessageIds.length === 0) {
      setVisibleInitialUnreadCount(0)
      return
    }
    const { visibleIds } = measureVisibleMessageIds(initialUnreadMessageIds)
    if (visibleIds.length > 0) {
      let newlySeen = false
      visibleIds.forEach((id) => {
        if (!seenInitialUnreadIdsRef.current.has(id)) {
          seenInitialUnreadIdsRef.current.add(id)
          newlySeen = true
        }
      })
      if (newlySeen) {
        setVisibleInitialUnreadCount(seenInitialUnreadIdsRef.current.size)
      }
    }
  }, [measureVisibleMessageIds, initialUnreadCount, initialUnreadMessageIds])

  const unreadAnchorForConversation =
    capturedUnreadAnchor?.conversationId === conversation.id ? capturedUnreadAnchor : null
  const loadedUnreadMessageIds = useMemo(() => {
    if (unreadDisplayCount <= 0) return []

    const firstUnreadIndex = firstUnreadId ? allMessages.findIndex((msg) => msg.id === firstUnreadId) : -1
    if (firstUnreadIndex >= 0) {
      const startIndex = Math.max(0, firstUnreadIndex - unreadDisplayCount + 1)
      return allMessages.slice(startIndex, firstUnreadIndex + 1).map((msg) => msg.id)
    }

    return allMessages.slice(0, unreadDisplayCount).map((msg) => msg.id)
  }, [allMessages, firstUnreadId, unreadDisplayCount])
  const syncVisibleLoadedUnreadCount = useCallback(() => {
    const container = scrollRef.current
    if (!container || loadedUnreadMessageIds.length === 0) {
      return
    }
    const containerRect = container.getBoundingClientRect()

    let minTop = Number.POSITIVE_INFINITY
    let topmostVisibleIndex = -1
    let foundVisible = false

    for (let i = 0; i < loadedUnreadMessageIds.length; i++) {
      const messageId = loadedUnreadMessageIds[i]
      const el = document.getElementById(`msg-${messageId}`)
      if (el) {
        const rect = el.getBoundingClientRect()
        const isVisible = rect.bottom > containerRect.top && rect.top < containerRect.bottom
        if (isVisible) {
          foundVisible = true
          if (rect.top < minTop) {
            minTop = rect.top
            topmostVisibleIndex = i
          }
        }
      }
    }

    if (foundVisible) {
      setVisibleLoadedUnreadCount(topmostVisibleIndex + 1)
    } else {
      const newestUnreadId = loadedUnreadMessageIds[0]
      const newestEl = document.getElementById(`msg-${newestUnreadId}`)
      if (newestEl) {
        const rect = newestEl.getBoundingClientRect()
        if (rect.top >= containerRect.bottom) {
          setVisibleLoadedUnreadCount(loadedUnreadMessageIds.length)
        } else if (rect.bottom <= containerRect.top) {
          setVisibleLoadedUnreadCount(0)
        }
      }
    }
  }, [loadedUnreadMessageIds, scrollRef])
  const floatingUnreadCount = Math.max(0, unreadDisplayCount - visibleLoadedUnreadCount)

  // (newMsgCount accumulation is handled by the latestMessageId effect above)

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

  // Reset unread state when switching conversations
  useEffect(() => {
    resetToBottom()
  }, [conversation.id, resetToBottom])

  useEffect(() => {
    lastReadSentId.current = capturedUnreadCount > 0 ? (conversation.lastMessage?.id ?? null) : null
    setDeferredUiReady(false)
    setFirstUnreadId(null)
    setUnreadDisplayCount(0)
    setNewMsgCount(0)
    setIsBottomSentinelVisible(true)
    setShowScrollToBottomButton(false)
    setInitialUnreadCount(capturedUnreadCount)
    setVisibleInitialUnreadCount(0)
    setVisibleLoadedUnreadCount(0)
    setFloatingUnreadReady(capturedUnreadCount <= 0)
    setIsUnreadDividerVisible(false)
    setUnreadUiReady(capturedUnreadCount <= 0)
    initialUnreadCutoffRef.current = conversation.lastMessage?.timestamp ?? null
    anchorInitialized.current = false
    pendingScrollToUnread.current = false
    seenInitialUnreadIdsRef.current.clear()
    seenLoadedUnreadIdsRef.current.clear()
    setIsSearchSidebarOpen(false)
    if (newMsgClearTimerRef.current) {
      clearTimeout(newMsgClearTimerRef.current)
      newMsgClearTimerRef.current = null
    }
    if (dividerVisibleTimerRef.current) {
      clearTimeout(dividerVisibleTimerRef.current)
      dividerVisibleTimerRef.current = null
    }
  }, [conversation.id]) // Intentionally omit capturedUnreadCount so we don't reset UI when mark-as-read completes

  useEffect(() => {
    if (isLoading) return
    const rafId = requestAnimationFrame(() => {
      setDeferredUiReady(true)
    })
    return () => cancelAnimationFrame(rafId)
  }, [conversation.id, isLoading])

  useEffect(() => {
    if (!unreadUiReady) return
    if (!isBottomSentinelVisible || newMsgCount > 0) {
      setShowScrollToBottomButton(true)
      return
    }
    if (isBottomSentinelVisible) {
      setShowScrollToBottomButton(false)
    }
  }, [unreadUiReady, isBottomSentinelVisible, newMsgCount])

  useEffect(() => {
    if (!isBottomSentinelVisible) return
    if (newMsgClearTimerRef.current) {
      clearTimeout(newMsgClearTimerRef.current)
    }
    newMsgClearTimerRef.current = setTimeout(() => {
      setNewMsgCount(0)
      if (initialUnreadCount > 0) {
        setInitialUnreadCount(0)
        setVisibleInitialUnreadCount(0)
      }
      newMsgClearTimerRef.current = null
    }, 180)
    return () => {
      if (newMsgClearTimerRef.current) {
        clearTimeout(newMsgClearTimerRef.current)
        newMsgClearTimerRef.current = null
      }
    }
  }, [isBottomSentinelVisible, newMsgCount, initialUnreadCount])

  // Initialize unread state from the sidebar snapshot and V2 messages once per conversation.
  useEffect(() => {
    if (anchorInitialized.current) return

    if (unreadAnchorForConversation) {
      if (allMessages.length === 0) return
      const anchorId = unreadAnchorForConversation.firstUnreadMessageId
      if (!anchorId) {
        anchorInitialized.current = true
        setFloatingUnreadReady(true)
        setUnreadUiReady(true)
        return
      }

      anchorInitialized.current = true
      requestAnimationFrame(() => initializeUnreadUi(anchorId, unreadAnchorForConversation.unreadCount))
      return
    }

    if (capturedUnreadCount <= 0) {
      anchorInitialized.current = true
      setFloatingUnreadReady(true)
      setUnreadUiReady(true)
      return
    }
  }, [allMessages.length, capturedUnreadCount, conversation.id, initializeUnreadUi, unreadAnchorForConversation])

  // getBoundingClientRect: debounced markAsRead when divider enters viewport
  const checkDividerVisibility = useCallback(() => {
    if (!unreadDividerEl || !scrollRef.current) {
      setIsUnreadDividerVisible(false)
      return
    }
    const dividerRect = unreadDividerEl.getBoundingClientRect()
    const containerRect = scrollRef.current.getBoundingClientRect()
    const isVisible = dividerRect.bottom > containerRect.top && dividerRect.top < containerRect.bottom
    setIsUnreadDividerVisible(isVisible)
    if (isVisible && document.visibilityState === 'visible') {
      if (!dividerVisibleTimerRef.current) {
        dividerVisibleTimerRef.current = setTimeout(() => {
          if (lastReadSentId.current !== latestMessageIdRef.current) {
            lastReadSentId.current = latestMessageIdRef.current ?? null
            markAsReadRef.current({ conversationId: conversation.id, lastReadMessageId: latestMessageIdRef.current })
          }
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
    if (!unreadUiReady || !unreadDividerEl) return
    requestAnimationFrame(() => checkDividerVisibility())
    return () => {
      if (dividerVisibleTimerRef.current) {
        clearTimeout(dividerVisibleTimerRef.current)
        dividerVisibleTimerRef.current = null
      }
    }
  }, [unreadUiReady, unreadDividerEl, allMessages, checkDividerVisibility])

  useEffect(() => {
    const el = scrollRef.current
    if (!unreadUiReady || !el || !firstUnreadId || !unreadDisplayCount) return
    const onScroll = () => {
      requestAnimationFrame(() => checkDividerVisibility())
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [unreadUiReady, firstUnreadId, unreadDisplayCount, checkDividerVisibility, scrollRef])

  useEffect(() => {
    if (!unreadUiReady || initialUnreadCount <= 0) return
    requestAnimationFrame(syncVisibleInitialUnreadCount)
  }, [unreadUiReady, allMessages, initialUnreadCount, syncVisibleInitialUnreadCount])

  useEffect(() => {
    if (!unreadUiReady || unreadDisplayCount <= 0 || !firstUnreadId) return
    requestAnimationFrame(syncVisibleLoadedUnreadCount)
  }, [unreadUiReady, allMessages, unreadDisplayCount, firstUnreadId, syncVisibleLoadedUnreadCount])

  useEffect(() => {
    const el = scrollRef.current
    if (!unreadUiReady || !el || initialUnreadCount <= 0) return

    const onScroll = () => requestAnimationFrame(syncVisibleInitialUnreadCount)
    const onResize = () => requestAnimationFrame(syncVisibleInitialUnreadCount)

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [unreadUiReady, conversation.id, initialUnreadCount, scrollRef, syncVisibleInitialUnreadCount])

  useEffect(() => {
    const el = scrollRef.current
    if (!unreadUiReady || !el || unreadDisplayCount <= 0 || !firstUnreadId) return

    const onScroll = () => requestAnimationFrame(syncVisibleLoadedUnreadCount)
    const onResize = () => requestAnimationFrame(syncVisibleLoadedUnreadCount)

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [unreadUiReady, conversation.id, unreadDisplayCount, firstUnreadId, scrollRef, syncVisibleLoadedUnreadCount])

  // Retry the scroll once pending pages finish loading
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

  // Scroll and highlight after jump-to-message renders
  useEffect(() => {
    if (!jumpTargetMessageId) return

    // Step 3: Once the element exists in DOM, scroll and flash it
    const el = document.getElementById(`msg-${jumpTargetMessageId}`)
    if (el) {
      suppressFetchRef.current = true
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })

      const timer = setTimeout(() => {
        suppressFetchRef.current = false
        setHighlightKeyword(null)
        setJumpTargetId(null)
        setJumpTargetMessageId(null)
      }, 1000)

      pendingJumpRef.current = false
      return () => clearTimeout(timer)
    } else if (pendingJumpRef.current && !isFetchingNextPage && !isLoading && !isFetching) {
      // If we finished fetching but message still not found, stop waiting
      pendingJumpRef.current = false
      setJumpTargetMessageId(null)
    }
  }, [jumpTargetMessageId, isFetchingNextPage, isLoading, isFetching, allMessages])

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
              onClick={handleStartVoiceCall}
              disabled={isCallLoading || isCloudConversation || callState.phase !== 'idle' || groupCallState.phase !== 'idle'}
              className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block disabled:opacity-40 disabled:cursor-not-allowed'
              title={text['chat-window'].voiceCall}
            >
              <Phone className='w-[18px] h-[18px]' />
            </button>
            <button
              onClick={handleStartVideoCall}
              disabled={isCallLoading || isCloudConversation || callState.phase !== 'idle' || groupCallState.phase !== 'idle'}
              className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block disabled:opacity-40 disabled:cursor-not-allowed'
              title={text['chat-window'].videoCall}
            >
              <Video className='w-4 h-4' />
            </button>
            <div className='w-px h-5 bg-border mx-1 hidden sm:block' />
            <button
              onClick={() => setIsSearchSidebarOpen(!isSearchSidebarOpen)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isSearchSidebarOpen ? 'bg-blue-50 text-primary hover:bg-blue-100' : 'hover:bg-muted'
              )}
            >
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

        {/* Active Group Call Banner */}
        {conversation.isGroup && activeGroupCall && (
          <div className='flex items-center justify-between px-4 py-3 bg-blue-50/85 dark:bg-blue-950/40 backdrop-blur-md border-b border-blue-100/50 dark:border-blue-900/30 animate-in fade-in slide-in-from-top duration-300 relative z-20'>
            <div className='flex items-center gap-3'>
              <div className='relative flex h-3.5 w-3.5 items-center justify-center shrink-0'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500'></span>
              </div>
              <div className='flex flex-col min-w-0'>
                <span className='text-sm font-semibold text-blue-950 dark:text-blue-200 truncate'>
                  Cuộc gọi nhóm đang diễn ra
                </span>
                <span className='text-xs text-blue-700/70 dark:text-blue-300/60 truncate'>
                  Bắt đầu bởi {activeGroupCall.callerName} • Trò chuyện bằng {activeGroupCall.callKind === 'video' ? 'Video' : 'Giọng nói'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleJoinGroupCall(activeGroupCall.roomId, activeGroupCall.callKind)}
              className='flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold rounded-full shadow-md shadow-emerald-500/25 transition-all shrink-0 cursor-pointer'
            >
              Tham gia
            </button>
          </div>
        )}

        {/* Pin Board & Messages Wrapper */}
        <div className='flex-1 relative flex flex-col min-h-0'>
          {/* Pin Board */}
          {deferredUiReady && !isCloudConversation && !isAiConversation && (
            <PinBoard conversationId={conversation.id} onScrollToMessage={jumpToMessage} />
          )}

          {/* Floating Unread Button */}
          {unreadUiReady &&
            floatingUnreadReady &&
            !isUnreadDividerVisible &&
            firstUnreadId &&
            floatingUnreadCount > 0 && (
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
                    {floatingUnreadCount > 99 ? '99+' : floatingUnreadCount}
                  </span>
                </button>
              </div>
            )}

          {/* Scroll-to-bottom button */}
          {unreadUiReady && showScrollToBottomButton && (
            <div className='absolute bottom-4 right-4 z-20'>
              <button
                type='button'
                onClick={() => {
                  scrollToBottom()
                  setNewMsgCount(0)
                  setInitialUnreadCount(0)
                  setVisibleInitialUnreadCount(0)
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
                {newMsgCount > 0 && (
                  <span className='absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full leading-none'>
                    {newMsgCount > 99 ? '99+' : newMsgCount}
                  </span>
                )}
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className='flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse custom-scrollbar'
            style={{ overflowAnchor: 'auto' }}
          >
            <div
              ref={bottomSentinelRef}
              className='h-px w-full shrink-0'
              style={{ overflowAnchor: 'none' }}
              aria-hidden='true'
            />
            {isLoading && (
              <div className='flex items-center justify-center flex-1 text-sm text-primary py-8'>{text.loading}</div>
            )}
            {isFetchingPreviousPage && (
              <div className='py-4 text-center text-sm text-muted-foreground'>{text.loading}</div>
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
                  <div
                    id={`msg-${msg.id}`}
                    className={jumpTargetMessageId === msg.id ? 'highlight-message' : ''}
                    ref={isNewestVisible ? lastMessageRef : null}
                  >
                    <MessageBubble
                      message={msg}
                      highlightKeyword={jumpTargetMessageId === msg.id ? highlightKeyword : null}
                      isHighlighted={jumpTargetMessageId === msg.id}
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
                      onJoinGroupCall={handleJoinGroupCall}
                      activeGroupCallId={activeGroupCall?.roomId}
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
          {deferredUiReady && (
            <TypingIndicator typingUsers={typingUsers.filter((u) => u.conversationId === conversation.id)} />
          )}
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
        (deferredUiReady || isSearchSidebarOpen) &&
        (isInfoSidebarOpen || isSearchSidebarOpen) && (
          <>
            {(isInfoSidebarOpen || isSearchSidebarOpen) && (
              <div
                className='absolute inset-0 bg-transparent z-[35] min-[1150px]:hidden animate-in fade-in duration-200 cursor-pointer'
                onClick={() => {
                  setIsInfoSidebarOpen(false)
                  setIsSearchSidebarOpen(false)
                }}
              />
            )}
            <div
              className={cn(
                'h-full pointer-events-auto z-[40] bg-background w-[340px] shrink-0 border-l border-border',
                window.innerWidth < 1150 ? 'absolute top-0 right-0 shadow-2xl overflow-hidden' : 'relative'
              )}
            >
              {isSearchSidebarOpen ? (
                <SearchSidebar
                  conversationId={conversation.id}
                  onClose={() => setIsSearchSidebarOpen(false)}
                  onNavigateToMessage={(msgId, keyword) => {
                    setTimeout(() => {
                      void navigateToMessage(conversation.id, msgId, keyword)
                    }, 300)
                  }}
                />
              ) : (
                <ChatInfoSidebar
                  conversation={conversation}
                  onRenameClick={() => setIsRenameDialogOpen(true)}
                  onAvatarClick={triggerFileInput}
                  managementOpenSignal={managementOpenSignal}
                />
              )}
            </div>
          </>
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
        <OutgoingCallScreen
          callData={callState.callData}
          callKind={callState.callKind}
          onCancel={cancelOutgoing}
          onConnect={connectCall}
        />
      )}

      {callState.phase === 'active' && callState.callData && (
        <VideoCallRoom callData={callState.callData} callKind={callState.callKind} onCallEnd={endCall} />
      )}

      {callState.incoming && (
        <IncomingCallDialog
          callerName={callState.incoming.callerName}
          callerAvatar={callState.incoming.callerAvatar}
          sessionId={callState.incoming.sessionId}
          callKind={callState.incoming.callKind}
          onAccept={acceptIncoming}
          onReject={handleRejectIncoming}
        />
      )}

      {/* Group Call Overlays */}
      {groupCallState.phase === 'active' && groupCallState.roomId && (
        <GroupCallRoom
          roomId={groupCallState.roomId}
          callKind={groupCallState.callKind}
          isMicOn={groupCallState.isMicOn}
          isCameraOn={groupCallState.isCameraOn}
          onCallEnd={handleEndGroupCall}
        />
      )}

      {incomingGroupCall && (
        <GroupIncomingCallDialog
          callerName={incomingGroupCall.callerName}
          callerAvatar={incomingGroupCall.callerAvatar}
          groupName={incomingGroupCall.groupName}
          roomId={incomingGroupCall.roomId}
          callKind={incomingGroupCall.callKind}
          onAccept={handleAcceptGroupCall}
          onReject={handleRejectGroupCall}
        />
      )}
    </div>
  )
}
