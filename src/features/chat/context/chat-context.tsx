import { createContext, useContext, type ReactNode } from 'react'
import { useChatWebSocket } from '../hooks/use-chat-websocket'
import type { ReplyMetadata } from '../schemas/chat.schema'

type ChatContextType = {
  connected: boolean
  sendMessage: (conversationId: string, content: string, replyTo?: ReplyMetadata | null, isForwarded?: boolean) => void
  revokeMessage: (messageId: string, conversationId: string) => Promise<void>
  deleteMessageForMe: (messageId: string, conversationId: string) => Promise<void>
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
