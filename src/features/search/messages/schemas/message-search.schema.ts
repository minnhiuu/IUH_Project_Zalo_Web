export interface MessageSearchRequest {
  keyword?: string
  conversationId: string
  senderId?: string
  from?: string // ISO format
  to?: string // ISO format
  dateRange?: '7d' | '30d' | '3months'
}

export interface MessageSearchResponse {
  messageId: string
  conversationId: string
  senderId: string
  senderName: string | null
  senderAvatar: string | null
  content: string | null
  size: number | null
  type: string
  status: string
  hasAttachment: boolean
  hasLink: boolean
  createdAt: string // ISO format (Instant)
  highlights: string | null
}
