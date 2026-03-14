import { ChatProvider, ChatLayout } from '@/features/chat'

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  )
}
