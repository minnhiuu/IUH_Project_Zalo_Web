import { useParams, useLocation } from 'react-router'
import { ChatLayout, ChatProvider } from '@/features/chat'

export default function ChatPage() {
  const { id, token } = useParams<{ id: string; token: string }>()
  const location = useLocation()

  const isUserRoute = location.pathname.startsWith('/chat/u/')

  return (
    <ChatProvider>
      <ChatLayout
        defaultPartnerId={isUserRoute ? id : undefined}
        defaultConversationId={!isUserRoute && !token ? id : undefined}
        defaultJoinToken={token}
      />
    </ChatProvider>
  )
}
