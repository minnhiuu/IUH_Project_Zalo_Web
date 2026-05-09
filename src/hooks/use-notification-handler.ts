import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router'
import { useNotificationBadge } from './use-notification-badge'
import { useNotificationStateQuery } from '@/features/notification/queries/use-queries'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'

// Cấu hình Throttling âm thanh
const MAX_SOUNDS_PER_PERIOD = 3
const SOUND_PERIOD_MS = 60000 // 1 phút

export function useNotificationHandler() {
  const { data: notificationState } = useNotificationStateQuery()
  const { id: activeConversationId } = useParams<{ id: string }>()

  // Chỉ dùng State cho các sự kiện real-time nhận được qua Socket (không được render)
  const realtimeNotificationsRef = useRef<Map<string, string>>(new Map())

  const [lastMessageContent, setLastMessageContent] = useState<string | null>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const prevBadgeCountRef = useRef(notificationState?.notificationBadgeCount ?? 0)

  const soundHistory = useRef<number[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Âm thanh "tinh tinh" Base64 chuyên nghiệp
    const dingSound =
      'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQyAFRTU0UAAAAPAAADTGF2ZjYwLjEwMC4xMDAAAAAAAAAAAAAAAABf/+MUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/4xTEYAAAADSAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/4xTE4AAAADSAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/4xTFAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
    audioRef.current = new Audio(dingSound)
  }, [])

  const currentBadgeCount = notificationState?.notificationBadgeCount ?? 0

  // Track badge count changes with ref to avoid cascading renders
  useEffect(() => {
    prevBadgeCountRef.current = currentBadgeCount
  }, [currentBadgeCount])

  useEffect(() => {
    if (!lastMessageContent) {
      return
    }

    const interval = setInterval(() => {
      setIsFlashing((prev) => !prev)
    }, 1200)

    return () => {
      clearInterval(interval)
      setIsFlashing(false)
    }
  }, [lastMessageContent])

  const processIncomingAlert = useCallback(
    (data: {
      id?: string
      senderId?: string
      alertMessage?: string
      conversationId?: string
      type?: string
      referenceId?: string
      silent?: boolean
    }) => {
      const { id, senderId, alertMessage, conversationId, type, referenceId, silent } = data

      if (conversationId && activeConversationId === conversationId) return

      if (senderId || id) {
        const next = new Map(realtimeNotificationsRef.current)

        let compositeKey = (senderId || 'system') + '_' + (type || 'UNKNOWN')
        if (referenceId) {
          compositeKey += '_' + referenceId
        }

        const systemKey = `system_realtime_${compositeKey}`
        const key = conversationId ? conversationId : systemKey
        next.set(key, senderId || 'system')
        realtimeNotificationsRef.current = next
      }

      if (silent) return // Skip sound and flashing for silent notifications

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
        referenceId: payload.referenceId || undefined,
        silent: payload.silent
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

  useEffect(() => {
    const handleClear = () => {
      realtimeNotificationsRef.current = new Map()
      setLastMessageContent(null)
    }
    window.addEventListener('notification:marked-as-read', handleClear)
    return () => window.removeEventListener('notification:marked-as-read', handleClear)
  }, [])

  // Update Tab Badge = notificationBadgeCount từ backend (đã tính = unreadCount + chat conversations)
  useNotificationBadge({
    count: currentBadgeCount,
    showDot: currentBadgeCount > 0,
    lastMessage: isFlashing ? lastMessageContent : null,
    title: 'BondHub'
  })

  return {
    unreadCount: notificationState?.unreadCount ?? 0,
    notificationBadgeCount: notificationState?.notificationBadgeCount ?? 0,
    systemUnreadCount: notificationState?.notificationBadgeCount ?? 0 // For sidebar badge display
  }
}
