import { z } from 'zod'
import { MessageType, Status, MessageStatus } from '@/constants/enum'

export const ConversationMemberResponseSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable().optional(),
  lastReadMessageId: z.string().nullable().optional(),
  role: z.string().nullable().optional()
})

export type ConversationMemberResponse = z.infer<typeof ConversationMemberResponseSchema>

export const ReplyMetadataSchema = z.object({
  messageId: z.string(),
  senderId: z.string(),
  senderName: z.string().nullable().optional(),
  content: z.string(),
  type: z.nativeEnum(MessageType)
})

export type ReplyMetadata = z.infer<typeof ReplyMetadataSchema>

// ────────────────────────────────────────────────────────────────
// ConversationResponse — Room-centric (ObjectId-based)
// Breaking change: conversationId → id, partner* → name/avatar/status/isGroup
// ────────────────────────────────────────────────────────────────
export const ConversationResponseSchema = z.object({
  id: z.string(),                                               // MongoDB ObjectId của room
  recipientId: z.string().nullable().optional(),                // recipientId cho lazy creation (1-1)
  name: z.string().nullable().optional(),                       // partnerName (1-1) | group name
  avatar: z.string().nullable().optional(),                     // partnerAvatar (1-1) | group avatar
  status: z.nativeEnum(Status).nullable().optional(),           // partner online status (1-1 only)
  friendshipStatus: z.string().nullable().optional(),           // status from friend-service
  lastSeenAt: z.string().datetime().nullable().optional(),
  isGroup: z.boolean().default(false),
  lastMessage: z.string().nullable().optional(),
  lastMessageId: z.string().nullable().optional(),
  lastMessageTime: z.string().datetime().nullable().optional(),
  isLastMessageFromMe: z.boolean().nullable().optional(),
  lastMessageType: z.nativeEnum(MessageType).nullable().optional(),
  unreadCount: z.number().nullable().optional(),
  lastMessageStatus: z.nativeEnum(MessageStatus).nullable().optional(),
  members: z.array(ConversationMemberResponseSchema).nullable().optional()
})

export type ConversationResponse = z.infer<typeof ConversationResponseSchema>

// ────────────────────────────────────────────────────────────────
// MessageResponse — recipientId removed
// ────────────────────────────────────────────────────────────────
export const MessageResponseSchema = z.object({
  id: z.string(),
  conversationId: z.string().nullable().optional(),
  senderId: z.string(),
  senderName: z.string().nullable().optional(),
  senderAvatar: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  type: z.nativeEnum(MessageType),
  clientMessageId: z.string().nullable().optional(),
  status: z.nativeEnum(MessageStatus).default(MessageStatus.NORMAL),
  createdAt: z.string().datetime().nullable().optional(),
  lastModifiedAt: z.string().datetime().nullable().optional(),
  replyTo: ReplyMetadataSchema.nullable().optional(),
  isForwarded: z.boolean().nullable().optional(),
  unreadCount: z.number().nullable().optional(),
  isFromMe: z.boolean().nullable().optional()
})

export type MessageResponse = z.infer<typeof MessageResponseSchema>

export const ChatUserSchema = z.object({
  id: z.string(),
  accountId: z.string().nullable().optional(),
  fullName: z.string(),
  email: z.string().email().nullable().optional(),
  status: z.nativeEnum(Status),
  avatar: z.string().nullable().optional(),
  lastUpdatedAt: z.string().datetime().nullable().optional(),
  friendIds: z.array(z.string()).nullable().optional(),
  isInvisible: z.boolean().nullable().optional()
})

export type ChatUser = z.infer<typeof ChatUserSchema>

// ────────────────────────────────────────────────────────────────
// ChatMessageRequest
// ────────────────────────────────────────────────────────────────
export const ChatMessageRequestSchema = z.object({
  conversationId: z.string().nullable().optional(),
  recipientId: z.string().nullable().optional(),
  content: z.string(),
  clientMessageId: z.string().optional(),
  replyTo: ReplyMetadataSchema.nullable().optional(),
  isForwarded: z.boolean().optional()
})

export type ChatMessageRequest = z.infer<typeof ChatMessageRequestSchema>
