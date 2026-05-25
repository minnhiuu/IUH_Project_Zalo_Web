import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getAccessToken } from '@/lib/axios-client'
import { notificationKeys } from '../queries/keys'
import type { NotificationSocketMessage, NotificationCleanupData } from '../schemas/notification.schema'

const isCleanupMessage = (data: NotificationSocketMessage): data is NotificationCleanupData => {
  return (data as NotificationCleanupData).action === 'DELETE'
}

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

export const useNotificationSocket = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const stompClientRef = useRef<Client | null>(null)

  const connect = useCallback(() => {
    if (stompClientRef.current?.active) return
    const token = getAccessToken()
    if (!token || !user) return

    const socket = new SockJS(WS_URL)
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        setConnected(true)
        console.log('[NotificationSocket] Connected')

        // ────────── /user/queue/notifications ──────────
        client.subscribe('/user/queue/notifications', (payload) => {
          try {
            const data = JSON.parse(payload.body) as NotificationSocketMessage
            console.log('[NotificationSocket] Received message:', data)

            // 1. Handle Cleanup/Delete action
            if (isCleanupMessage(data)) {
              console.log('[NotificationSocket] Cleaning up notification:', data.referenceId)
              // Delay invalidation so user can see "Accepted/Declined" status for a moment
              setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: notificationKeys.all })
              }, 3000)
              return
            }

            // 2. Dispatch custom event for global UI feedback
            window.dispatchEvent(
              new CustomEvent('notification:received', {
                detail: data
              })
            )

            queryClient.invalidateQueries({ queryKey: notificationKeys.all })
          } catch (error) {
            console.error('[NotificationSocket] Error handling notification:', error)
          }
        })
      },
      onDisconnect: () => {
        setConnected(false)
        console.log('[NotificationSocket] Disconnected')
      }
    })

    client.activate()
    stompClientRef.current = client
  }, [user, queryClient])

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate()
    }
  }, [])

  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }
    return () => disconnect()
  }, [user, connect, disconnect])

  return { connected }
}
