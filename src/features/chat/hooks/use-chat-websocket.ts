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
          const rawMsg = JSON.parse(payload.body)
          const msg: MessageResponse = {
            ...rawMsg,
            createdAt: rawMsg.createdAt || rawMsg.timestamp
          }
          
          if (msg.senderId === user.id) {
            // ACK for my own message
            if (msg.recipientId) {
              queryClient.setQueryData(chatKeys.messages(msg.recipientId), (oldData: any) => {
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
                          (m.clientMessageId && m.clientMessageId === msg.clientMessageId) ? { ...msg, status: 'SENT' } : m
                        )
                      },
                      ...oldData.pages.slice(1)
                    ]
                  }
                }
                return {
                  ...oldData,
                  pages: [{ ...firstPage, data: [{ ...msg, status: 'SENT' }, ...firstPage.data] }, ...oldData.pages.slice(1)]
                }
              })
            }
            return
          }

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
                unreadCount: msg.unreadCount !== undefined ? msg.unreadCount : (conversations[existingConvIndex].unreadCount || 0) + 1,
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

        client.subscribe('/user/queue/read-receipts', (payload) => {
          const receipt = JSON.parse(payload.body)
          queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
            if (!oldData) return oldData
            return oldData.map((conv: ConversationResponse) => {
              if (conv.chatId !== receipt.chatId) return conv
              const updatedMembers = conv.members?.map(m => 
                m.userId === receipt.userId 
                  ? { ...m, lastReadMessageId: receipt.lastReadMessageId } 
                  : m
              )
              return { ...conv, members: updatedMembers }
            })
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

      const clientMessageId = `temp-${Date.now()}`
      const chatMessage: ChatMessageRequest = {
        recipientId,
        content: content.trim(),
        clientMessageId
      }

      stompClientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage)
      })

      const now = new Date().toISOString()
      const optimisticMsg: MessageResponse = {
        id: clientMessageId,
        clientMessageId,
        senderId: user?.id || '',
        recipientId,
        content,
        type: 'CHAT' as any,
        status: 'PENDING',
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
