import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useQueryClient } from '@tanstack/react-query'
import { chatKeys } from '../queries/keys'
import type { MessageResponse, ConversationResponse, ChatMessageRequest } from '../schemas/chat.schema'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getAccessToken } from '@/lib/axios-client'

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '/ws') || 'http://localhost:8080/ws'

export const useChatWebSocket = () => {
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

        client.subscribe('/user/queue/messages', (payload) => {
          const msg: MessageResponse = JSON.parse(payload.body)
          if (msg.senderId === user.id) return

          queryClient.setQueryData(chatKeys.messages(msg.senderId), (oldData: any) => {
            if (!oldData) return oldData
            const firstPage = oldData.pages[0]
            const newFirstPage = {
              ...firstPage,
              data: [msg, ...firstPage.data]
            }
            return {
              ...oldData,
              pages: [newFirstPage, ...oldData.pages.slice(1)]
            }
          })

          queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
            if (!oldData) return oldData
            const conversations: ConversationResponse[] = oldData
            const existingConvIndex = conversations.findIndex((c) => c.partnerId === msg.senderId)

            if (existingConvIndex >= 0) {
              const updatedConv = {
                ...conversations[existingConvIndex],
                lastMessage: msg.content,
                lastMessageTime: msg.createdAt,
                hasUnread: true
              }
              return [
                updatedConv,
                ...conversations.slice(0, existingConvIndex),
                ...conversations.slice(existingConvIndex + 1)
              ]
            } else {
              queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
              return oldData
            }
          })
        })

        client.subscribe('/user/queue/presence', (payload) => {
          const presence = JSON.parse(payload.body)
          queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
            if (!oldData) return oldData
            return oldData.map((conv: ConversationResponse) =>
              conv.partnerId === presence.userId
                ? { ...conv, partnerStatus: presence.status, lastSeenAt: presence.timestamp }
                : conv
            )
          })
        })

        client.subscribe('/user/queue/conversations', (payload) => {
          try {
            const newConv = JSON.parse(payload.body)
            if (newConv.chatId) {
              queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
                 if (!oldData) return oldData
                 if (oldData.find((u: any) => u.chatId === newConv.chatId)) return oldData
                 return [newConv, ...oldData].sort((a,b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
              })
            } else if (newConv.type === 'REFRESH') {
              queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
            }
          } catch {
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
          }
        })

        client.publish({
          destination: '/app/user.addUser',
          body: JSON.stringify(user)
        })
      },
      onDisconnect: () => {
        setConnected(false)
      }
    })

    client.activate()
    stompClientRef.current = client
  }, [user, queryClient])

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      if (stompClientRef.current.connected && user) {
        stompClientRef.current.publish({
          destination: '/app/user.disconnectUser',
          body: JSON.stringify(user)
        })
      }
      stompClientRef.current.deactivate()
    }
    setConnected(false)
  }, [user])

  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }
    return () => disconnect()
  }, [user, connect, disconnect])

  const sendMessage = useCallback(
    (recipientId: string, content: string) => {
      if (!stompClientRef.current?.connected || !content.trim()) return

      const chatMessage: ChatMessageRequest = {
        recipientId,
        content: content.trim()
      }

      stompClientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage)
      })

      const now = new Date().toISOString()
      const optimisticMsg: MessageResponse = {
        id: 'temp-' + Date.now(),
        senderId: user?.id || '',
        recipientId,
        content,
        type: 'CHAT' as any,
        createdAt: now,
        lastModifiedAt: now,
        chatId: undefined,
        senderName: user?.fullName,
        senderAvatar: undefined
      }

      queryClient.setQueryData(chatKeys.messages(recipientId), (oldData: any) => {
        if (!oldData) return oldData
        const firstPage = oldData.pages[0]
        return {
          ...oldData,
          pages: [{ ...firstPage, data: [optimisticMsg, ...firstPage.data] }, ...oldData.pages.slice(1)]
        }
      })

      queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
        if (!oldData) return oldData
        const conversations: ConversationResponse[] = oldData
        const existingConvIndex = conversations.findIndex((c) => c.partnerId === recipientId)
        if (existingConvIndex >= 0) {
          const updatedConv = {
            ...conversations[existingConvIndex],
            lastMessage: content,
            lastMessageTime: now
          }
          return [
            updatedConv,
            ...conversations.slice(0, existingConvIndex),
            ...conversations.slice(existingConvIndex + 1)
          ]
        }
        return oldData
      })
    },
    [user, queryClient]
  )

  return { connected, sendMessage }
}
