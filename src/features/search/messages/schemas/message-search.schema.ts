export interface MessageSearchRequest {
  keyword?: string
  conversationId?: string // Optional for global search
  senderId?: string
  from?: number // Epoch millis
  to?: number // Epoch millis
  dateRange?: '7d' | '30d' | '3months'
  fileType?: string
}


export const MESSAGE_SEARCH_SECTION = {
  All: 'all',
  Messages: 'messages',
  Files: 'files'
} as const

export type MessageSearchSection = (typeof MESSAGE_SEARCH_SECTION)[keyof typeof MESSAGE_SEARCH_SECTION]

export interface MessageSearchResponse {
  messageId: string
  conversationId: string
  senderId: string
  senderName: string | null
  senderAvatar: string | null
  displayContent: string | null
  size: number | null
  type: string
  status: string
  hasAttachment: boolean
  hasLink: boolean
  isGroup: boolean
  conversationName: string | null
  conversationAvatar: string | null
  participantNames: string[] | null
  participantAvatars: (string | null)[] | null
  createdAt: string // ISO format (Instant)
  displayHighlights: string | null
}

export interface MessageSearchSectionResponse {
  data: MessageSearchResponse[]
  page: number
  totalPages: number
  limit: number
  totalItems: number
}

export interface ConversationSearchResponse {
  conversationId: string
  recipientId: string | null
  name: string
  avatar: string | null
  group: boolean
  memberCount: number
  participantNames: string[] | null
  participantAvatars: (string | null)[] | null
  displayHighlights: string | null
}

export interface ConversationSearchSectionResponse {
  data: ConversationSearchResponse[]
  page: number
  totalPages: number
  limit: number
  totalItems: number
}
