import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { PageResponse } from '@/shared/api'
import { chatKeys } from '../queries/keys'
import { friendKeys } from '@/features/friend/queries/keys'
import type {
  MessageResponse,
  ConversationResponse,
  ChatMessageRequest,
  ReplyMetadata,
  TypingEvent
} from '../schemas/chat.schema'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getAccessToken } from '@/lib/axios-client'
import { MessageStatus, MessageType } from '@/constants/enum'
import { BONDHUB_AI } from '@/constants/system'
import { aiStreamingRegistry } from './ai-streaming-registry'
import {
  useSendMessageMutation,
  useRevokeMessageMutation,
  useDeleteMessageForMeMutation
} from '../queries/use-mutations'
import { uploadFileApi } from '../api/chat.api'
import type { FileAttachment } from '../context/chat-context'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

import { normalizeDateTime } from '../utils/date-utils'
const JOIN_LINK_REGEX = /^https?:\/\/[^/]+\/g\/[a-zA-Z0-9_-]+$/

export const useChatWebSocket = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingEvent[]>([])
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
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

          if (rawMsg.senderId === BONDHUB_AI.userId) {
            console.log('>>> [DEBUG WS] Nhận tin nhắn AI hoàn chỉnh từ server:', rawMsg)
          }

          const msg: MessageResponse = {
            ...rawMsg,
            createdAt: normalizeDateTime(rawMsg.createdAt || rawMsg.timestamp),
            lastModifiedAt: normalizeDateTime(rawMsg.lastModifiedAt)
          }

          const conversationId = msg.conversationId
          if (!conversationId) return

          const isOwnMessage = msg.isFromMe === true || msg.senderId === user.id

          // --- AI STREAMING DEDUPLICATION / SYNC ---
          // Khi nhận tin nhắn hoàn chỉnh từ AI qua WebSocket, ta ưu tiên lưu vào cache
          // để lấy ID thật từ MongoDB, đồng thời tắt trạng thái streaming tự tạo của FE.
          if (msg.senderId === BONDHUB_AI.userId && aiStreamingRegistry.isStreaming(conversationId)) {
            console.log('[WebSocket] Nhận tin nhắn hoàn tất từ AI, thay thế stream tự tạo bằng tin nhắn thật:', msg.id)
            aiStreamingRegistry.setStreaming(conversationId, false)
            // Không return, cho phép cập nhật vào Messages Cache!
          }

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

          // 2. Update Conversations Cache
          // Negative system actions should NOT move conversation to top
          const msgMetadata = msg.metadata as Record<string, unknown> | null | undefined
          const isNegativeSystemAction =
            msg.type === MessageType.System &&
            (msgMetadata?.action === 'LEAVE_GROUP' ||
              msgMetadata?.action === 'DISBAND_GROUP' ||
              msgMetadata?.action === 'REMOVE_MEMBER' ||
              msgMetadata?.action === 'BLOCK_MEMBER' ||
              msgMetadata?.action === 'ADD_MEMBERS_FAILED')

          queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
            if (!oldData) return oldData
            const conversations: ConversationResponse[] = oldData
            const existingConvIndex = conversations.findIndex((c) => c.id === conversationId)

            if (existingConvIndex >= 0) {
              const existingConv = conversations[existingConvIndex]
              const existingUnread = existingConv.unreadCount || 0
              // Avoid double-increment: if /queue/conversations already updated lastMessage
              // to this same message, unreadCount was already set by BE — don't add +1 again.
              const alreadyApplied = existingConv.lastMessage?.id === msg.id
              const computedUnread = isOwnMessage || alreadyApplied ? existingUnread : existingUnread + 1

              // Special handling for BLOCK_MEMBER / REMOVE_MEMBER (target me): keep in sidebar but remove from members
              const removeTargetIds = Array.isArray(msgMetadata?.targetIds) ? msgMetadata.targetIds.map(String) : []
              const isCurrentUserRemovedAtTop =
                (msgMetadata?.action === 'REMOVE_MEMBER' || msgMetadata?.action === 'BLOCK_MEMBER') &&
                removeTargetIds.includes(String(user.id))

              if (isCurrentUserRemovedAtTop) {
                const updatedMembers = (existingConv.members ?? []).filter(
                  (m) => !removeTargetIds.includes(String(m.userId))
                )
                const updated = [...conversations]
                updated[existingConvIndex] = {
                  ...existingConv,
                  members: updatedMembers,
                  lastMessage: {
                    id: msg.id,
                    content: msg.content,
                    timestamp: msg.createdAt || new Date().toISOString(),
                    isFromMe: false,
                    type: msg.type,
                    status: msg.status,
                    senderName: msg.senderName,
                    senderId: msg.senderId,
                    metadata: msg.metadata
                  },
                  unreadCount: 0
                }
                return updated
              }

              if (isNegativeSystemAction) {
                // Compute which user IDs to remove from members list
                const removedIds: string[] =
                  msgMetadata?.action === 'LEAVE_GROUP'
                    ? [String(msg.senderId)]
                    : msgMetadata?.action === 'REMOVE_MEMBER' || msgMetadata?.action === 'BLOCK_MEMBER'
                      ? Array.isArray(msgMetadata?.targetIds)
                        ? (msgMetadata.targetIds as unknown[]).map(String)
                        : []
                      : [] // DISBAND_GROUP / ADD_MEMBERS_FAILED — no member list update needed

                const updatedMembers = removedIds.length
                  ? (existingConv.members ?? []).filter((m) => !removedIds.includes(String(m.userId)))
                  : existingConv.members

                const updated = [...conversations]
                updated[existingConvIndex] = {
                  ...existingConv,
                  members: updatedMembers,
                  lastMessage: {
                    id: msg.id,
                    content: msg.content,
                    timestamp: existingConv.lastMessage?.timestamp || msg.createdAt || new Date().toISOString(),
                    isFromMe: isOwnMessage,
                    type: msg.type,
                    status: msg.status,
                    senderName: msg.senderName,
                    senderId: msg.senderId,
                    metadata: msg.metadata
                  },
                  unreadCount: existingConv.unreadCount || 0
                }
                return updated
              }

              const updatedConv: ConversationResponse = {
                ...existingConv,
                members: existingConv.members,
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
                unreadCount: computedUnread
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

          // 3. Invalidate media/file cache so sidebar updates in real-time
          if (msg.type === MessageType.Image || msg.type === MessageType.Video || msg.type === MessageType.File) {
            queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'media', conversationId] })
          }

          // 4. Special handling for DISBAND_GROUP / REMOVE_MEMBER(target me): Clear messages cache
          const metadata = msg.metadata as Record<string, unknown> | null | undefined
          const isDisbandAction = metadata?.action === 'DISBAND_GROUP'
          const removeTargetIds = Array.isArray(metadata?.targetIds) ? metadata.targetIds.map(String) : []
          const isCurrentUserRemoved =
            (metadata?.action === 'REMOVE_MEMBER' || metadata?.action === 'BLOCK_MEMBER') &&
            removeTargetIds.includes(String(user.id))
          const isCurrentUserLeftGroup =
            metadata?.action === 'LEAVE_GROUP' && String(msg.senderId || '') === String(user.id)

          if (isDisbandAction || isCurrentUserRemoved || isCurrentUserLeftGroup) {
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

          // 4. Re-added to group: refetch messages so BE applies joinedAt filter correctly
          const isCurrentUserReAdded = metadata?.action === 'ADD_MEMBERS' && removeTargetIds.includes(String(user.id))
          if (isCurrentUserReAdded) {
            queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) })
          }

          // 5. Invalidate pins cache when a pin/unpin system message arrives
          if (metadata?.action === 'PIN_MESSAGE' || metadata?.action === 'UNPIN_MESSAGE') {
            queryClient.invalidateQueries({ queryKey: chatKeys.pins(conversationId) })
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
                    data: page.data.map((m: MessageResponse) => {
                      if (m.id === update.messageId) {
                        return {
                          ...m,
                          status: update.newStatus,
                          content: null,
                          ...(update.deletedByAdminId ? { deletedByAdminId: update.deletedByAdminId } : {})
                        }
                      }
                      if (m.replyTo?.messageId === update.messageId) {
                        return { ...m, replyTo: { ...m.replyTo, content: null } }
                      }
                      return m
                    })
                  }))
                }
              }
            )

            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
          }
        })

        // ────────── /queue/reactions ──────────
        client.subscribe('/user/queue/reactions', (payload) => {
          const update = JSON.parse(payload.body)
          if (update.type === 'REACTION_UPDATE') {
            queryClient.setQueryData(
              chatKeys.messages(update.conversationId),
              (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                if (!oldData) return oldData
                return {
                  ...oldData,
                  pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                    ...page,
                    data: page.data.map((m: MessageResponse) =>
                      m.id === update.messageId
                        ? {
                            ...m,
                            reactions:
                              update.reactions && Object.keys(update.reactions).length ? update.reactions : undefined
                          }
                        : m
                    )
                  }))
                }
              }
            )
          }
        })

        // ────────── /queue/friendship-updates ──────────
        client.subscribe('/user/queue/friendship-updates', (payload) => {
          const update = JSON.parse(payload.body)
          if (update.type === 'FRIENDSHIP_UPDATED') {
            const { partnerId, status, friendshipId, requestedBy, receivedBy } = update.payload

            // 1. Update the StrangerBanner's friend status via React Query Cache
            queryClient.setQueryData(friendKeys.status(partnerId), {
              status,
              friendshipId: friendshipId || undefined,
              requestedBy,
              receivedBy
            })

            // 2. Update the Chat Layout proxy/real conversation status
            queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
              if (!oldData) return oldData
              return oldData.map((conv: ConversationResponse) => {
                if (conv.isGroup) return conv
                const hasMember = conv.members?.some((m) => m.userId === partnerId) || conv.recipientId === partnerId
                if (hasMember) {
                  return { ...conv, friendshipStatus: status }
                }
                return conv
              })
            })
          }
        })

        client.subscribe('/user/queue/conversations', (payload) => {
          try {
            interface RawConversation extends Partial<ConversationResponse> {
              lastMessageTime?: number[]
              type?: string
            }
            const rawConv = JSON.parse(payload.body) as RawConversation
            const newConv: ConversationResponse = {
              ...(rawConv as ConversationResponse)
            }

            // Normalize lastMessageTime if it's an array (Jackson format)
            const rawTime = rawConv.lastMessageTime
            if (Array.isArray(rawTime)) {
              const [y, m, d, h, min, s, ns] = rawTime
              const date = new Date(y, m - 1, d, h || 0, min || 0, s || 0, ns ? ns / 1000000 : 0)

              // If newConv has lastMessage, update its timestamp
              if (newConv.lastMessage) {
                newConv.lastMessage.timestamp = date.toISOString()
              }
            }

            if (newConv.id) {
              queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
                const currentData = oldData || []
                const exists = currentData.some((u: ConversationResponse) => u.id === newConv.id)

                let nextData
                if (exists) {
                  nextData = currentData.map((c) => {
                    if (c.id !== newConv.id) return c
                    // If /queue/messages already set a newer lastMessage (different ID),
                    // preserve it — don't let /queue/conversations overwrite with stale data
                    const keepCachedLastMessage =
                      (c.lastMessage?.id && newConv.lastMessage?.id && c.lastMessage.id !== newConv.lastMessage.id) ||
                      (c.lastMessage?.id && !newConv.lastMessage?.id)
                    // System messages don't increment unreadCounts in DB, so /queue/conversations
                    // may arrive with a lower (stale) unreadCount than what /queue/messages already
                    // computed locally. Take the max so the red dot doesn't flash then vanish.
                    const mergedUnreadCount = Math.max(c.unreadCount || 0, newConv.unreadCount || 0)
                    return {
                      ...c,
                      ...newConv,
                      unreadCount: mergedUnreadCount,
                      name: newConv.name ?? c.name,
                      avatar: newConv.avatar ?? c.avatar,
                      recipientId: newConv.recipientId ?? c.recipientId,
                      ...(keepCachedLastMessage ? { lastMessage: c.lastMessage } : {})
                    }
                  })
                } else {
                  // New conversation pushed by /queue/conversations (e.g. newly added member).
                  // If the last message is a non-negative system action, ensure at least unread: 1
                  // so the red dot appears (system messages don't increment unreadCounts in DB).
                  const lastMeta = newConv.lastMessage?.metadata as Record<string, unknown> | null | undefined
                  const isNonNegativeSystemMsg =
                    newConv.lastMessage?.type === MessageType.System &&
                    lastMeta?.action !== 'DISBAND_GROUP' &&
                    lastMeta?.action !== 'REMOVE_MEMBER' &&
                    lastMeta?.action !== 'LEAVE_GROUP' &&
                    lastMeta?.action !== 'BLOCK_MEMBER' &&
                    lastMeta?.action !== 'ADD_MEMBERS_FAILED'
                  nextData = [
                    {
                      ...newConv,
                      unreadCount: isNonNegativeSystemMsg
                        ? Math.max(newConv.unreadCount || 0, 1)
                        : newConv.unreadCount || 0
                    },
                    ...currentData
                  ]
                }

                return nextData.sort(
                  (a, b) =>
                    new Date(b.lastMessage?.timestamp || 0).getTime() -
                    new Date(a.lastMessage?.timestamp || 0).getTime()
                )
              })

              // Real-time updates for group-related sidebars
              if (newConv.id) {
                queryClient.invalidateQueries({ queryKey: chatKeys.groupMembers(newConv.id, '') })
                queryClient.invalidateQueries({ queryKey: chatKeys.joinRequests(newConv.id) })
                queryClient.invalidateQueries({ queryKey: chatKeys.friendsDirectory(newConv.id) })
              }
            } else if (rawConv.type === 'REFRESH') {
              queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
              queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'join-requests'] })
            }
          } catch (error) {
            console.error('[Socket] Error handling conversation update:', error)
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
          }
        })

        // ────────── /queue/typing ──────────
        client.subscribe('/user/queue/typing', (payload) => {
          try {
            const event: TypingEvent = JSON.parse(payload.body)
            if (!event.conversationId) return

            const key = `${event.conversationId}:${event.userId}`

            if (event.isTyping) {
              setTypingUsers((prev) => {
                const filtered = prev.filter((u) => `${u.conversationId}:${u.userId}` !== key)
                return [...filtered, event]
              })
              // auto-remove after 5s in case typing-stop never arrives
              const existing = typingTimeoutsRef.current.get(key)
              if (existing) clearTimeout(existing)
              const t = setTimeout(() => {
                setTypingUsers((prev) => prev.filter((u) => `${u.conversationId}:${u.userId}` !== key))
                typingTimeoutsRef.current.delete(key)
              }, 5000)
              typingTimeoutsRef.current.set(key, t)
            } else {
              setTypingUsers((prev) => prev.filter((u) => `${u.conversationId}:${u.userId}` !== key))
              const existing = typingTimeoutsRef.current.get(key)
              if (existing) {
                clearTimeout(existing)
                typingTimeoutsRef.current.delete(key)
              }
            }
          } catch {
            // ignore
          }
        })

        // ────────── /queue/join-requests ──────────
        client.subscribe('/user/queue/join-requests', (payload) => {
          const update = JSON.parse(payload.body)
          if (update.conversationId) {
            queryClient.invalidateQueries({ queryKey: chatKeys.joinRequests(update.conversationId) })
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
          }
        })

        // ────────── /queue/call-signals ──────────
        client.subscribe('/user/queue/call-signals', (payload) => {
          try {
            const signal = JSON.parse(payload.body)
            window.dispatchEvent(new CustomEvent('call-signal', { detail: signal }))
          } catch (error) {
            console.error('[Socket] Error handling call signal:', error)
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

      const clientMessageId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const isFake = conversationId.startsWith('fake_')
      const chatMessage: ChatMessageRequest = {
        conversationId: isFake ? null : conversationId,
        recipientId: isFake ? conversationId.replace('fake_', '') : null,
        content: content.trim(),
        clientMessageId,
        replyTo,
        isForwarded
      }

      sendMsgMutate(chatMessage)

      const now = new Date().toISOString()
      const isLink = JOIN_LINK_REGEX.test(content.trim())
      const optimisticMsg: MessageResponse = {
        id: clientMessageId,
        clientMessageId,
        senderId: user?.id || '',
        content,
        type: isLink ? MessageType.Link : MessageType.Chat,
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
          const existsOptimistic = firstPage.data.some(
            (m: MessageResponse) => m.clientMessageId === clientMessageId || m.id === clientMessageId
          )
          if (existsOptimistic) return oldData
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

  const sendFileMessage = useCallback(
    async (conversationId: string, files: FileAttachment[], content: string = '', replyTo?: ReplyMetadata | null) => {
      if (!stompClientRef.current?.connected || files.length === 0) return

      const isFake = conversationId.startsWith('fake_')
      const folder = `conversations/direct/${conversationId}/messages`

      const isMediaFile = (f: File) => f.type.startsWith('image/') || f.type.startsWith('video/')
      const mediaFiles = files.filter((a) => isMediaFile(a.file))
      const otherFiles = files.filter((a) => !isMediaFile(a.file))

      // ── 1. All images/videos → ONE message, upload in parallel ─────────────
      if (mediaFiles.length > 0) {
        const clientMessageId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const now = new Date().toISOString()
        const allVideo = mediaFiles.every((a) => a.file.type.startsWith('video/'))
        const msgType = allVideo ? MessageType.Video : MessageType.Image
        const trimmedContent = content.trim()

        const optimisticMsg: MessageResponse = {
          id: clientMessageId,
          clientMessageId,
          senderId: user?.id || '',
          content: trimmedContent || '',
          type: msgType,
          status: MessageStatus.NORMAL,
          createdAt: now,
          lastModifiedAt: now,
          conversationId,
          senderName: user?.fullName,
          senderAvatar: user?.avatar || undefined,
          replyTo,
          attachments: mediaFiles.map((a) => ({
            key: '',
            url: a.previewUrl || '',
            fileName: a.file.name,
            originalFileName: a.file.name,
            contentType: a.file.type,
            size: a.file.size
          }))
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

        const mediaPreview =
          trimmedContent ||
          (mediaFiles.length === 1
            ? allVideo
              ? '[Video]'
              : '[Hình ảnh]'
            : `[${mediaFiles.length} ${allVideo ? 'video' : 'ảnh'}]`)
        queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
          if (!oldData) return oldData
          const idx = oldData.findIndex((c) => c.id === conversationId)
          if (idx < 0) return oldData
          return [
            {
              ...oldData[idx],
              lastMessage: {
                id: clientMessageId,
                content: mediaPreview,
                timestamp: now,
                isFromMe: true,
                type: msgType,
                status: MessageStatus.NORMAL,
                senderName: user?.fullName,
                senderId: user?.id
              }
            },
            ...oldData.slice(0, idx),
            ...oldData.slice(idx + 1)
          ]
        })

        try {
          const uploadResults = await Promise.all(mediaFiles.map((a) => uploadFileApi(a.file, folder)))
          sendMsgMutate({
            conversationId: isFake ? null : conversationId,
            recipientId: isFake ? conversationId.replace('fake_', '') : null,
            content: content || '',
            clientMessageId,
            replyTo: replyTo || undefined,
            attachments: uploadResults.map((r) => ({
              key: r.key,
              url: r.url,
              fileName: r.fileName,
              originalFileName: r.originalFileName,
              contentType: r.contentType,
              size: r.size
            }))
          })
        } catch (error) {
          console.error('[Chat] Failed to upload & send media:', error)
          queryClient.setQueryData(
            chatKeys.messages(conversationId),
            (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                  ...page,
                  data: page.data.filter((m: MessageResponse) => m.clientMessageId !== clientMessageId)
                }))
              }
            }
          )
        }
      }

      // ── 2. Files → one message per file ─────────────────────────────────────
      for (const attachment of otherFiles) {
        const clientMessageId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const { file } = attachment
        const now = new Date().toISOString()

        const optimisticMsg: MessageResponse = {
          id: clientMessageId,
          clientMessageId,
          senderId: user?.id || '',
          content: content || file.name,
          type: MessageType.File,
          status: MessageStatus.NORMAL,
          createdAt: now,
          lastModifiedAt: now,
          conversationId,
          senderName: user?.fullName,
          senderAvatar: user?.avatar || undefined,
          replyTo,
          attachments: [
            {
              key: '',
              url: attachment.previewUrl || '',
              fileName: file.name,
              originalFileName: file.name,
              contentType: file.type,
              size: file.size
            }
          ]
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
          const idx = oldData.findIndex((c) => c.id === conversationId)
          if (idx < 0) return oldData
          return [
            {
              ...oldData[idx],
              lastMessage: {
                id: clientMessageId,
                content: `[Tệp] ${file.name}`,
                timestamp: now,
                isFromMe: true,
                type: MessageType.File,
                status: MessageStatus.NORMAL,
                senderName: user?.fullName,
                senderId: user?.id
              }
            },
            ...oldData.slice(0, idx),
            ...oldData.slice(idx + 1)
          ]
        })

        try {
          const uploadResult = await uploadFileApi(file, folder)
          sendMsgMutate({
            conversationId: isFake ? null : conversationId,
            recipientId: isFake ? conversationId.replace('fake_', '') : null,
            content: content || file.name,
            clientMessageId,
            replyTo: replyTo || undefined,
            attachments: [
              {
                key: uploadResult.key,
                url: uploadResult.url,
                fileName: uploadResult.fileName,
                originalFileName: uploadResult.originalFileName,
                contentType: uploadResult.contentType,
                size: uploadResult.size
              }
            ]
          })
        } catch (error) {
          console.error('[Chat] Failed to upload & send file:', error)
          queryClient.setQueryData(
            chatKeys.messages(conversationId),
            (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                  ...page,
                  data: page.data.filter((m: MessageResponse) => m.clientMessageId !== clientMessageId)
                }))
              }
            }
          )
        }
      }
    },
    [user, queryClient, sendMsgMutate]
  )

  const sendTyping = useCallback((conversationId: string, isTyping: boolean, userName: string) => {
    if (!stompClientRef.current?.connected) return
    stompClientRef.current.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId, isTyping, userName, platform: 'PC' })
    })
  }, [])

  return { connected, sendMessage, sendFileMessage, revokeMessage, deleteMessageForMe, sendTyping, typingUsers }
}
