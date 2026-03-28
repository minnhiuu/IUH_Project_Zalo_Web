import { ChatProvider, ChatLayout } from '@/features/chat'
import { useAuthContext } from '@/features/auth/context/auth-context'

export default function CloudPage() {
  const { user } = useAuthContext()

  return (
    <ChatProvider>
      <ChatLayout defaultPartnerId={user?.id} />
    </ChatProvider>
  )
}
