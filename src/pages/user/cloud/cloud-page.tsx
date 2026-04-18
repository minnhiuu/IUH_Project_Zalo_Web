import { ChatLayout } from '@/features/chat'
import { useAuthContext } from '@/features/auth/context/auth-context'

export default function CloudPage() {
  const { user } = useAuthContext()

  return <ChatLayout defaultPartnerId={user?.id} />
}
