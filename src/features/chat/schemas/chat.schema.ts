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
  content: z.string().nullable(),
  type: z.nativeEnum(MessageType),
  thumbnailUrl: z.string().nullable().optional()
})

export type ReplyMetadata = z.infer<typeof ReplyMetadataSchema>

export const LastMessageResponseSchema = z.object({
  id: z.string().nullable().optional(),
  senderId: z.string().nullable().optional(),
  senderName: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  timestamp: z.string().datetime().nullable().optional(),
  type: z.nativeEnum(MessageType).nullable().optional(),
  status: z.nativeEnum(MessageStatus).nullable().optional(),
  isFromMe: z.boolean().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional()
})

export type LastMessageResponse = z.infer<typeof LastMessageResponseSchema>

// ────────────────────────────────────────────────────────────────
// GroupSettings — group permission toggles
// ────────────────────────────────────────────────────────────────
export const GroupSettingsSchema = z.object({
  memberCanChangeInfo: z.boolean().default(true),
  memberCanPinMessages: z.boolean().default(true),
  memberCanCreateNotes: z.boolean().default(true),
  memberCanCreatePolls: z.boolean().default(true),
  memberCanSendMessages: z.boolean().default(true),
  membershipApprovalEnabled: z.boolean().default(false),
  highlightAdminMessages: z.boolean().default(true),
  newMembersCanReadRecent: z.boolean().default(true),
  joinByLinkEnabled: z.boolean().default(false),
  joinQuestion: z.string().nullable().optional()
})

export type GroupSettings = z.infer<typeof GroupSettingsSchema>

// ────────────────────────────────────────────────────────────────
// ConversationResponse — Room-centric (ObjectId-based)
// Breaking change: conversationId → id, partner* → name/avatar/status/isGroup
// ────────────────────────────────────────────────────────────────
export const ConversationResponseSchema = z.object({
  id: z.string(), // MongoDB ObjectId của room
  recipientId: z.string().nullable().optional(), // recipientId cho lazy creation (1-1)
  name: z.string().nullable().optional(), // partnerName (1-1) | group name
  avatar: z.string().nullable().optional(), // partnerAvatar (1-1) | group avatar
  status: z.nativeEnum(Status).nullable().optional(), // partner online status (1-1 only)
  friendshipStatus: z.string().nullable().optional(), // status from friend-service
  lastSeenAt: z.string().datetime().nullable().optional(),
  isGroup: z.boolean().default(false),
  isDisbanded: z.boolean().default(false),
  unreadCount: z.number().nullable().optional(),
  lastMessage: LastMessageResponseSchema.nullable().optional(),
  members: z.array(ConversationMemberResponseSchema).nullable().optional(),
  settings: GroupSettingsSchema.nullable().optional(),
  joinLinkToken: z.string().nullable().optional(),
  pendingJoinRequestCount: z.number().nullable().optional(),
  invitedUserIds: z.array(z.string()).nullable().optional()
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
  isFromMe: z.boolean().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  attachments: z
    .array(
      z.object({
        key: z.string(),
        url: z.string(),
        fileName: z.string(),
        originalFileName: z.string(),
        contentType: z.string(),
        size: z.number()
      })
    )
    .nullable()
    .optional(),
  linkPreview: z
    .object({
      url: z.string(),
      token: z.string(),
      groupName: z.string().nullable().optional(),
      groupAvatar: z.string().nullable().optional(),
      memberCount: z.number(),
      memberPreviews: z.array(z.object({ name: z.string(), avatar: z.string().nullable().optional() }))
    })
    .nullable()
    .optional(),
  // emoji → array of userIds
  reactions: z.record(z.string(), z.array(z.string())).nullable().optional(),
  deletedByAdminId: z.string().nullable().optional()
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
export const AttachmentRequestSchema = z.object({
  key: z.string(),
  url: z.string(),
  fileName: z.string(),
  originalFileName: z.string(),
  contentType: z.string(),
  size: z.number()
})

export type AttachmentRequest = z.infer<typeof AttachmentRequestSchema>

export const ChatMessageRequestSchema = z.object({
  conversationId: z.string().nullable().optional(),
  recipientId: z.string().nullable().optional(),
  content: z.string(),
  clientMessageId: z.string().optional(),
  replyTo: ReplyMetadataSchema.nullable().optional(),
  isForwarded: z.boolean().optional(),
  attachments: z.array(AttachmentRequestSchema).nullable().optional()
})

export type ChatMessageRequest = z.infer<typeof ChatMessageRequestSchema>

export const GroupConversationCreateRequestSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().nullable().optional(),
  isGroup: z.literal(true),
  memberIds: z.array(z.string()).min(1)
})

export type GroupConversationCreateRequest = z.infer<typeof GroupConversationCreateRequestSchema>

export const LeaveGroupRequestSchema = z.object({
  silent: z.boolean().default(false),
  transferTo: z.string().nullable().optional(),
  blockReJoin: z.boolean().default(false)
})

export type LeaveGroupRequest = z.infer<typeof LeaveGroupRequestSchema>

export const GroupMemberListItemResponseSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  joinedAt: z.string().datetime().nullable().optional(),
  isFriend: z.boolean().default(false),
  isCurrentUser: z.boolean().default(false),
  joinMethod: z.string().nullable().optional(),
  addedBy: z.string().nullable().optional(),
  addedByName: z.string().nullable().optional()
})

export type GroupMemberListItemResponse = z.infer<typeof GroupMemberListItemResponseSchema>

export const AdminMemberResponseSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable().optional(),
  role: z.string().nullable().optional()
})

export type AdminMemberResponse = z.infer<typeof AdminMemberResponseSchema>

export const SearchMemberResponseSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  isAlreadyMember: z.boolean().default(false)
})

export type SearchMemberResponse = z.infer<typeof SearchMemberResponseSchema>

export interface JoinGroupPreviewResponse {
  conversationId: string
  groupName: string | null
  groupAvatar: string | null
  memberCount: number
  createdByName: string | null
  memberPreviews: { name: string; avatar: string | null }[]
  isAlreadyMember: boolean
  isBlockedFromGroup: boolean
  membershipApprovalEnabled: boolean
  hasPendingRequest: boolean
  joinQuestion: string | null
}

export interface JoinRequestResponse {
  id: string
  conversationId: string
  userId: string
  fullName: string
  avatar: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  requestedAt: string
  processedAt: string | null
  processedBy: string | null
  joinAnswer: string | null
}

export interface PinnedMessageInfo {
  messageId: string
  pinnedBy: string
  pinnedByName: string
  contentSnapshot: string
  messageType: string
  pinnedAt: string // ISO datetime
}

export interface TypingEvent {
  conversationId: string
  userId: string
  userName: string
  isTyping: boolean
  platform: 'PC' | 'MOBILE'
}
