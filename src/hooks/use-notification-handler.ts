import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams } from 'react-router'
import { useNotificationBadge } from './use-notification-badge'
import { useNotificationStateQuery } from '@/features/notification/queries/use-queries'
import { useConversationsQuery } from '@/features/chat/queries/use-queries'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'
import type { ConversationResponse } from '@/features/chat/schemas/chat.schema'

// Cấu hình Throttling âm thanh
const MAX_SOUNDS_PER_PERIOD = 3
const SOUND_PERIOD_MS = 60000 // 1 phút

export function useNotificationHandler() {
  const { data: notificationState } = useNotificationStateQuery()
  const { data: conversations } = useConversationsQuery()
  const { id: activeConversationId } = useParams<{ id: string }>()

  // Chỉ dùng State cho các sự kiện real-time nhận được qua Socket
  const [realtimeNotifications, setRealtimeNotifications] = useState<Map<string, string>>(new Map())

  // Tính toán con số tổng hợp (Tab Badge) bằng useMemo - Không dùng useEffect để setState
  const notificationsByConv = useMemo(() => {
    const combinedMap = new Map<string, string>()

    // 1. Lấy từ Server Chat (Hội thoại chưa đọc)
    if (conversations) {
      conversations.forEach((conv: ConversationResponse) => {
        if (conv.unreadCount && conv.unreadCount > 0) {
          combinedMap.set(conv.id, 'chat')
        }
      })
    }

    // 2. Lấy từ Server Notification (Đầu người chưa đọc)
    if (notificationState?.unreadActorIds && notificationState.unreadActorIds.length > 0) {
      notificationState.unreadActorIds.forEach((compositeKey: string) => {
        // compositeKey from BE is like "actorId_NOTIFICATION_TYPE" or "system_NOTIFICATION_TYPE"
        combinedMap.set(`system_realtime_${compositeKey}`, 'system')
      })
    } else if (notificationState?.uniqueActorCount && notificationState.uniqueActorCount > 0) {
      // Fallback in case unreadActorIds is missing
      for (let i = 0; i < notificationState.uniqueActorCount; i++) {
        combinedMap.set(`system_${i}`, 'system')
      }
    }

    // 3. Gộp các sự kiện real-time vừa nhận được
    realtimeNotifications.forEach((senderId, convId) => {
      combinedMap.set(convId, senderId)
    })

    // 4. Loại bỏ hội thoại đang mở (Nếu Server chưa kịp cập nhật)
    if (activeConversationId) {
      combinedMap.delete(activeConversationId)
    }

    return combinedMap
  }, [notificationState, conversations, realtimeNotifications, activeConversationId])

  const uniqueUnreadCount = notificationsByConv.size

  const [lastMessageContent, setLastMessageContent] = useState<string | null>(null)
  const [isFlashing, setIsFlashing] = useState(false)

  const soundHistory = useRef<number[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Âm thanh "tinh tinh" Base64 chuyên nghiệp
    const dingSound =
      'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQyAFRTU0UAAAAPAAADTGF2ZjYwLjEwMC4xMDAAAAAAAAAAAAAAAABf/+MUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/4xTEYAAAADSAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/4xTE4AAAADSAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/4xTFAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
    audioRef.current = new Audio(dingSound)
  }, [])

  useEffect(() => {
    if (uniqueUnreadCount === 0 || !lastMessageContent) {
      return
    }

    const interval = setInterval(() => {
      setIsFlashing((prev) => !prev)
    }, 1200)

    return () => {
      clearInterval(interval)
      setIsFlashing(false)
    }
  }, [uniqueUnreadCount, lastMessageContent])

  const processIncomingAlert = useCallback(
    (data: {
      id?: string
      senderId?: string
      alertMessage?: string
      conversationId?: string
      type?: string
      referenceId?: string
    }) => {
      const { id, senderId, alertMessage, conversationId, type, referenceId } = data

      if (conversationId && activeConversationId === conversationId) return

      if (senderId || id) {
        setRealtimeNotifications((prev) => {
          const next = new Map(prev)

          let compositeKey = (senderId || 'system') + '_' + (type || 'UNKNOWN')
          if (referenceId) {
            compositeKey += '_' + referenceId
          }

          const systemKey = `system_realtime_${compositeKey}`
          const key = conversationId ? conversationId : systemKey
          next.set(key, senderId || 'system')
          return next
        })
      }

      if (alertMessage && conversationId) {
        setLastMessageContent(alertMessage)
      }

      const now = Date.now()
      soundHistory.current = soundHistory.current.filter((time) => now - time < SOUND_PERIOD_MS)

      if (soundHistory.current.length < MAX_SOUNDS_PER_PERIOD) {
        if (!audioRef.current) {
          audioRef.current = new Audio('/sounds/notification.mp3')
        }
        audioRef.current.play().catch((e) => console.warn('Play sound failed', e))
        soundHistory.current.push(now)
      }
    },
    [activeConversationId]
  )

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const payload = (event as CustomEvent<NotificationGroupResponse>).detail
      const data = (payload.payload as Record<string, unknown>) || {}
      processIncomingAlert({
        id: payload.id,
        senderId: (data.senderId as string) || payload.actorIds?.[0],
        alertMessage: payload.title,
        conversationId: data.conversationId as string,
        type: payload.type,
        referenceId: payload.referenceId || undefined
      })
    }

    const handleChatMessage = (event: Event) => {
      const detail = (event as CustomEvent<{ senderId: string; senderName: string; conversationId: string }>).detail
      processIncomingAlert({
        senderId: detail.senderId,
        alertMessage: `${detail.senderName} đã nhắn tin cho bạn`,
        conversationId: detail.conversationId
      })
    }

    window.addEventListener('notification:received', handleNotification)
    window.addEventListener('chat:incoming-message', handleChatMessage)

    return () => {
      window.removeEventListener('notification:received', handleNotification)
      window.removeEventListener('chat:incoming-message', handleChatMessage)
    }
  }, [processIncomingAlert])

  const [prevUnreadCount, setPrevUnreadCount] = useState(uniqueUnreadCount)
  if (uniqueUnreadCount !== prevUnreadCount) {
    setPrevUnreadCount(uniqueUnreadCount)
    if (uniqueUnreadCount === 0) {
      setLastMessageContent(null)
    }
  }

  useEffect(() => {
    const handleClear = () => {
      setRealtimeNotifications(new Map())
      setLastMessageContent(null)
    }
    window.addEventListener('notification:marked-as-read', handleClear)
    return () => window.removeEventListener('notification:marked-as-read', handleClear)
  }, [])

  const chatUnreadCount = Array.from(notificationsByConv.keys()).filter((key) => !key.startsWith('system_')).length
  const systemUnreadCount = notificationsByConv.size - chatUnreadCount

  useNotificationBadge({
    count: notificationsByConv.size,
    showDot: chatUnreadCount > 0,
    lastMessage: isFlashing ? lastMessageContent : null,
    title: 'BondHub'
  })

  return {
    unreadCount: notificationsByConv.size,
    systemUnreadCount
  }
}
