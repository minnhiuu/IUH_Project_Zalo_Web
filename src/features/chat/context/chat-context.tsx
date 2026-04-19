import { createContext, useContext, type ReactNode } from 'react'
import { useChatWebSocket } from '../hooks/use-chat-websocket'
import type { ReplyMetadata, TypingEvent } from '../schemas/chat.schema'

export interface FileAttachment {
  file: File
  previewUrl?: string // blob URL for image/video preview
}

type ChatContextType = {
  connected: boolean
  sendMessage: (conversationId: string, content: string, replyTo?: ReplyMetadata | null, isForwarded?: boolean) => void
  sendFileMessage: (conversationId: string, files: FileAttachment[], replyTo?: ReplyMetadata | null) => Promise<void>
  revokeMessage: (messageId: string, conversationId: string) => Promise<void>
  deleteMessageForMe: (messageId: string, conversationId: string) => Promise<void>
  sendTyping: (conversationId: string, isTyping: boolean, userName: string) => void
  typingUsers: TypingEvent[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const chatWebSocket = useChatWebSocket()

  return <ChatContext.Provider value={chatWebSocket}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
