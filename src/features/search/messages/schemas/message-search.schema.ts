export interface MessageSearchRequest {
  keyword?: string
  conversationId: string
  senderId?: string
  from?: string // ISO format
  to?: string // ISO format
  dateRange?: '7d' | '30d' | '3months'
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

export interface MessageSearchOverviewResponse {
  messages: MessageSearchSectionResponse
  files: MessageSearchSectionResponse
}
