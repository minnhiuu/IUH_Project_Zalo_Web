import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useQueryClient } from '@tanstack/react-query'
import { chatKeys } from '../queries/keys'
import type { MessageResponse, ConversationResponse, ChatMessageRequest, ReplyMetadata } from '../schemas/chat.schema'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getAccessToken } from '@/lib/axios-client'
import http from '@/lib/axios-client'
import { MessageStatus } from '@/constants/enum'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

import { normalizeDateTime } from '../utils/date-utils'


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
          const rawMsg = JSON.parse(payload.body)
          const msg: MessageResponse = {
            ...rawMsg,
            createdAt: normalizeDateTime(rawMsg.createdAt || rawMsg.timestamp),
            lastModifiedAt: normalizeDateTime(rawMsg.lastModifiedAt)
          }

          const isOwnMessage = msg.senderId === user.id
          const partnerId = isOwnMessage ? msg.recipientId : msg.senderId

          if (!partnerId) return

          // 1. Update Messages Cache
          if (isOwnMessage) {
            // ACK/Sync logic for my own message
            queryClient.setQueryData(chatKeys.messages(partnerId), (oldData: any) => {
              if (!oldData) return oldData
              const firstPage = oldData.pages[0]
              const hasOptimistic = firstPage.data.some((m: any) => m.clientMessageId === msg.clientMessageId)
              if (hasOptimistic) {
                return {
                  ...oldData,
                  pages: [
                    {
                      ...firstPage,
                      data: firstPage.data.map((m: any) =>
                        m.clientMessageId && m.clientMessageId === msg.clientMessageId
                          ? { ...msg, status: MessageStatus.NORMAL }
                          : m
                      )
                    },
                    ...oldData.pages.slice(1)
                  ]
                }
              }
              return {
                ...oldData,
                pages: [
                  { ...firstPage, data: [{ ...msg, status: MessageStatus.NORMAL }, ...firstPage.data] },
                  ...oldData.pages.slice(1)
                ]
              }
            })
          } else {
            // Incoming message from partner
            queryClient.setQueryData(chatKeys.messages(partnerId), (oldData: any) => {
              if (!oldData) return oldData
              const firstPage = oldData.pages[0]
              return {
                ...oldData,
                pages: [{ ...firstPage, data: [msg, ...firstPage.data] }, ...oldData.pages.slice(1)]
              }
            })
          }

          // 2. Update Conversations Cache (Always move to top)
          queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
            if (!oldData) return oldData
            const conversations: ConversationResponse[] = oldData
            const existingConvIndex = conversations.findIndex((c) => c.partnerId === partnerId)

            if (existingConvIndex >= 0) {
              const updatedConv: ConversationResponse = {
                ...conversations[existingConvIndex],
                lastMessage: msg.content,
                lastMessageTime: msg.createdAt || new Date().toISOString(),
                isLastMessageFromMe: msg.isFromMe,
                lastMessageType: msg.type,
                unreadCount:
                  msg.unreadCount !== undefined
                    ? msg.unreadCount
                    : (conversations[existingConvIndex].unreadCount || 0) + (isOwnMessage ? 0 : 1),
                lastMessageStatus: msg.status
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

        client.subscribe('/user/queue/read-receipts', (payload) => {
          const receipt = JSON.parse(payload.body)
          queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
            if (!oldData) return oldData
            return oldData.map((conv: ConversationResponse) => {
              if (conv.chatId !== receipt.chatId) return conv
              const updatedMembers = conv.members?.map((m) =>
                m.userId === receipt.userId ? { ...m, lastReadMessageId: receipt.lastReadMessageId } : m
              )
              return { ...conv, members: updatedMembers }
            })
          })
        })

        client.subscribe('/user/queue/status-updates', (payload) => {
          const update = JSON.parse(payload.body)
          if (update.type === 'MESSAGE_STATUS_UPDATE') {
            queryClient.setQueryData(chatKeys.messages(update.partnerId), (oldData: any) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                  ...page,
                  data: page.data.map((m: any) =>
                    m.id === update.messageId ? { ...m, status: update.newStatus, content: null } : m
                  )
                }))
              }
            })

            // Also update conversation last message if needed
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
          }
        })

        client.subscribe('/user/queue/conversations', (payload) => {
          try {
            const newConv = JSON.parse(payload.body)
            if (newConv.chatId) {
              queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
                if (!oldData) return oldData
                if (oldData.find((u: any) => u.chatId === newConv.chatId)) return oldData
                return [newConv, ...oldData].sort(
                  (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
                )
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
    (recipientId: string, content: string, replyTo?: ReplyMetadata | null, isForwarded: boolean = false) => {
      if (!stompClientRef.current?.connected || (!content.trim() && !isForwarded)) return

      const clientMessageId = `temp-${Date.now()}`
      const chatMessage: ChatMessageRequest = {
        recipientId,
        content: content.trim(),
        clientMessageId,
        replyTo,
        isForwarded
      }

      // Send via REST – socket-service handles WebSocket push;
      // message-service handles persistence and Kafka event publishing.
      http.post('/messages/send', chatMessage).catch((err) => {
        console.error('Failed to send message', err)
      })

      const now = new Date().toISOString()
      const optimisticMsg: MessageResponse = {
        id: clientMessageId,
        clientMessageId,
        senderId: user?.id || '',
        recipientId,
        content,
        type: 'CHAT' as any,
        status: MessageStatus.NORMAL,
        createdAt: now,
        lastModifiedAt: now,
        chatId: undefined,
        senderName: user?.fullName,
        senderAvatar: undefined,
        replyTo,
        isForwarded
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
          const updatedConv: ConversationResponse = {
            ...conversations[existingConvIndex],
            lastMessage: content,
            lastMessageTime: now,
            isLastMessageFromMe: true,
            lastMessageType: optimisticMsg.type,
            lastMessageStatus: MessageStatus.NORMAL
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

  const revokeMessage = useCallback(
    async (messageId: string, partnerId: string) => {
      try {
        await http.patch(`/messages/${messageId}/revoke`)
        // Optimistic update
        queryClient.setQueryData(chatKeys.messages(partnerId), (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((m: any) =>
                m.id === messageId ? { ...m, status: MessageStatus.REVOKED, content: null } : m
              )
            }))
          }
        })
      } catch (error) {
        console.error('Failed to revoke message:', error)
      }
    },
    [queryClient]
  )

  const deleteMessageForMe = useCallback(
    async (messageId: string, partnerId: string) => {
      try {
        await http.delete(`/messages/me/${messageId}`)
        // Update local state: remove message immediately
        queryClient.setQueryData(chatKeys.messages(partnerId), (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((m: any) => m.id !== messageId)
            }))
          }
        })
      } catch (error) {
        console.error('Failed to delete message for me:', error)
      }
    },
    [queryClient]
  )

  return { connected, sendMessage, revokeMessage, deleteMessageForMe }
}
