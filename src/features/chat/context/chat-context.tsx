import { createContext, useContext, type ReactNode } from 'react'
import { useChatWebSocket } from '../hooks/use-chat-websocket'

type ChatContextType = {
  connected: boolean
  sendMessage: (recipientId: string, content: string) => void
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
