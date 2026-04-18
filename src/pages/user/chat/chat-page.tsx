import { useParams, useLocation } from 'react-router'
import { ChatLayout } from '@/features/chat'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()

  const isUserRoute = location.pathname.startsWith('/chat/u/')

  return (
    <ChatLayout defaultPartnerId={isUserRoute ? id : undefined} defaultConversationId={!isUserRoute ? id : undefined} />
  )
}
