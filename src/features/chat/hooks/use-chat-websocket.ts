import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { PageResponse } from '@/shared/api'
import { chatKeys } from '../queries/keys'
import type { MessageResponse, ConversationResponse, ChatMessageRequest, ReplyMetadata } from '../schemas/chat.schema'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getAccessToken } from '@/lib/axios-client'
import { MessageStatus, MessageType } from '@/constants/enum'
import {
  useSendMessageMutation,
  useRevokeMessageMutation,
  useDeleteMessageForMeMutation
} from '../queries/use-mutations'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

import { normalizeDateTime } from '../utils/date-utils'

export const useChatWebSocket = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const stompClientRef = useRef<Client | null>(null)
  const { mutate: sendMsgMutate } = useSendMessageMutation()
  const { mutate: revokeMsgMutate } = useRevokeMessageMutation()
  const { mutate: deleteMsgMutate } = useDeleteMessageForMeMutation()

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

        // ────────── /queue/messages ──────────
        client.subscribe('/user/queue/messages', (payload) => {
          const rawMsg = JSON.parse(payload.body)
          const msg: MessageResponse = {
            ...rawMsg,
            createdAt: normalizeDateTime(rawMsg.createdAt || rawMsg.timestamp),
            lastModifiedAt: normalizeDateTime(rawMsg.lastModifiedAt)
          }

          const conversationId = msg.conversationId
          if (!conversationId) return

          const isOwnMessage = msg.isFromMe === true || msg.senderId === user.id

          // 1. Update Messages Cache (key = conversationId)
          if (isOwnMessage) {
            queryClient.setQueryData(
              chatKeys.messages(conversationId),
              (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                if (!oldData) return oldData
                const firstPage = oldData.pages[0]
                const existsById = firstPage.data.some((m: MessageResponse) => m.id === msg.id)
                if (existsById) return oldData
                const hasOptimistic =
                  msg.clientMessageId &&
                  firstPage.data.some((m: MessageResponse) => m.clientMessageId === msg.clientMessageId)
                if (hasOptimistic) {
                  return {
                    ...oldData,
                    pages: [
                      {
                        ...firstPage,
                        data: firstPage.data.map((m: MessageResponse) =>
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
              }
            )
          } else {
            queryClient.setQueryData(
              chatKeys.messages(conversationId),
              (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                if (!oldData) return oldData
                const firstPage = oldData.pages[0]
                const existsById = firstPage.data.some((m: MessageResponse) => m.id === msg.id)
                if (existsById) return oldData
                return {
                  ...oldData,
                  pages: [{ ...firstPage, data: [msg, ...firstPage.data] }, ...oldData.pages.slice(1)]
                }
              }
            )
          }

          // 2. Update Conversations Cache (move to top)
          queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
            if (!oldData) return oldData
            const conversations: ConversationResponse[] = oldData
            const existingConvIndex = conversations.findIndex((c) => c.id === conversationId)

            if (existingConvIndex >= 0) {
              const updatedConv: ConversationResponse = {
                ...conversations[existingConvIndex],
                lastMessage: {
                  id: msg.id,
                  content: msg.content,
                  timestamp: msg.createdAt || new Date().toISOString(),
                  isFromMe: isOwnMessage,
                  type: msg.type,
                  status: msg.status,
                  senderName: msg.senderName,
                  senderId: msg.senderId,
                  metadata: msg.metadata
                },
                unreadCount:
                  msg.unreadCount !== undefined
                    ? msg.unreadCount
                    : (conversations[existingConvIndex].unreadCount || 0) + (isOwnMessage ? 0 : 1)
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

          // 3. Special handling for DISBAND_GROUP: Clear messages cache
          const metadata = msg.metadata as Record<string, unknown> | null | undefined
          if (metadata?.action === 'DISBAND_GROUP') {
            queryClient.setQueryData(
              chatKeys.messages(conversationId),
              (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                if (!oldData) return oldData
                return {
                  ...oldData,
                  pages: [
                    {
                      ...oldData.pages[0],
                      data: [msg] // Only keep the disband system message
                    }
                  ]
                }
              }
            )
          }
        })

        // ────────── /queue/presence ──────────
        client.subscribe('/user/queue/presence', (payload) => {
          const presence = JSON.parse(payload.body)
          queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
            if (!oldData) return oldData
            // Tìm conversation có member trùng userId để cập nhật status
            // Với 1-1 chat: cập nhật qua members hoặc top-level status
            return oldData.map((conv: ConversationResponse) => {
              if (conv.isGroup) return conv
              const hasMember = conv.members?.some((m) => m.userId === presence.userId)
              if (hasMember) {
                return { ...conv, status: presence.status, lastSeenAt: presence.timestamp }
              }
              return conv
            })
          })
        })

        // ────────── /queue/read-receipts ──────────
        client.subscribe('/user/queue/read-receipts', (payload) => {
          const receipt = JSON.parse(payload.body)
          queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
            if (!oldData) return oldData
            return oldData.map((conv: ConversationResponse) => {
              if (conv.id !== receipt.conversationId) return conv
              const updatedMembers = conv.members?.map((m) =>
                m.userId === receipt.userId ? { ...m, lastReadMessageId: receipt.lastReadMessageId } : m
              )
              return { ...conv, members: updatedMembers }
            })
          })
        })

        // ────────── /queue/status-updates ──────────
        client.subscribe('/user/queue/status-updates', (payload) => {
          const update = JSON.parse(payload.body)
          if (update.type === 'MESSAGE_STATUS_UPDATE') {
            // status-update giờ có conversationId thay vì partnerId
            queryClient.setQueryData(
              chatKeys.messages(update.conversationId),
              (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                if (!oldData) return oldData
                return {
                  ...oldData,
                  pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                    ...page,
                    data: page.data.map((m: MessageResponse) =>
                      m.id === update.messageId ? { ...m, status: update.newStatus, content: null } : m
                    )
                  }))
                }
              }
            )

            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
          }
        })

        // ────────── /queue/conversations ──────────
        client.subscribe('/user/queue/conversations', (payload) => {
          try {
            const newConv = JSON.parse(payload.body)
            if (newConv.id) {
              queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
                const currentData = oldData || []
                const exists = currentData.some((u: ConversationResponse) => u.id === newConv.id)

                let nextData
                if (exists) {
                  nextData = currentData.map((c) => (c.id === newConv.id ? { ...c, ...newConv } : c))
                } else {
                  nextData = [newConv, ...currentData]
                }

                return nextData.sort(
                  (a, b) =>
                    new Date(b.lastMessage?.timestamp || 0).getTime() -
                    new Date(a.lastMessage?.timestamp || 0).getTime()
                )
              })
            } else if (newConv.type === 'REFRESH') {
              queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
            }
          } catch (error) {
            console.error('[Socket] Error handling conversation update:', error)
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
  }, [user])

  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }
    return () => disconnect()
  }, [user, connect, disconnect])

  // ────────── sendMessage: conversationId thay vì recipientId ──────────
  const sendMessage = useCallback(
    (conversationId: string, content: string, replyTo?: ReplyMetadata | null, isForwarded: boolean = false) => {
      if (!stompClientRef.current?.connected || (!content.trim() && !isForwarded)) return

      const clientMessageId = `temp-${Date.now()}`
      const chatMessage: ChatMessageRequest = {
        conversationId,
        content: content.trim(),
        clientMessageId,
        replyTo,
        isForwarded
      }

      sendMsgMutate(chatMessage)

      const now = new Date().toISOString()
      const optimisticMsg: MessageResponse = {
        id: clientMessageId,
        clientMessageId,
        senderId: user?.id || '',
        content,
        type: MessageType.Chat,
        status: MessageStatus.NORMAL,
        createdAt: now,
        lastModifiedAt: now,
        conversationId,
        senderName: user?.fullName,
        senderAvatar: user?.avatar || undefined,
        replyTo,
        isForwarded
      }

      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
          if (!oldData) return oldData
          const firstPage = oldData.pages[0]
          return {
            ...oldData,
            pages: [{ ...firstPage, data: [optimisticMsg, ...firstPage.data] }, ...oldData.pages.slice(1)]
          }
        }
      )

      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return oldData
        const conversations: ConversationResponse[] = oldData
        const existingConvIndex = conversations.findIndex((c) => c.id === conversationId)
        if (existingConvIndex >= 0) {
          const updatedConv: ConversationResponse = {
            ...conversations[existingConvIndex],
            lastMessage: {
              id: clientMessageId,
              content,
              timestamp: now,
              isFromMe: true,
              type: optimisticMsg.type,
              status: MessageStatus.NORMAL,
              senderName: user?.fullName,
              senderId: user?.id
            }
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
    [user, queryClient, sendMsgMutate]
  )

  // ────────── revokeMessage: conversationId thay vì partnerId ──────────
  const revokeMessage = useCallback(
    async (messageId: string, conversationId: string) => {
      revokeMsgMutate(messageId)

      try {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                ...page,
                data: page.data.map((m: MessageResponse) =>
                  m.id === messageId ? { ...m, status: MessageStatus.REVOKED, content: null } : m
                )
              }))
            }
          }
        )
      } catch (error) {
        console.error('Failed to revoke message:', error)
      }
    },
    [queryClient, revokeMsgMutate]
  )

  // ────────── deleteMessageForMe: conversationId thay vì partnerId ──────────
  const deleteMessageForMe = useCallback(
    async (messageId: string, conversationId: string) => {
      deleteMsgMutate(messageId)

      try {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                ...page,
                data: page.data.filter((m: MessageResponse) => m.id !== messageId)
              }))
            }
          }
        )
      } catch (error) {
        console.error('Failed to delete message for me:', error)
      }
    },
    [queryClient, deleteMsgMutate]
  )

  return { connected, sendMessage, revokeMessage, deleteMessageForMe }
}
