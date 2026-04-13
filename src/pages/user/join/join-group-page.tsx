import { useParams, useNavigate } from 'react-router'
import { ChatProvider, ChatLayout } from '@/features/chat'
import { JoinGroupDialog } from '@/features/chat/components/group/dialogs/join-group-dialog'

export default function JoinGroupPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  return (
    <ChatProvider>
      <ChatLayout />
      <JoinGroupDialog
        open={true}
        onOpenChange={(open) => {
          if (!open) navigate('/', { replace: true })
        }}
        token={token || null}
      />
    </ChatProvider>
  )
}
