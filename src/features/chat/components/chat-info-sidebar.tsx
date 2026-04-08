import type { ConversationResponse } from '../schemas/chat.schema'
import { ChatInfoGroupSidebar } from './group/chat-info-group-sidebar'
import { ChatInfoDirectSidebar } from './chat-info-direct-sidebar'

interface ChatInfoSidebarProps {
  conversation: ConversationResponse
  onRenameClick?: () => void
  onAvatarClick?: () => void
  managementOpenSignal?: number
}

export function ChatInfoSidebar({
  conversation,
  onRenameClick,
  onAvatarClick,
  managementOpenSignal
}: ChatInfoSidebarProps) {
  if (conversation.isGroup) {
    return (
      <ChatInfoGroupSidebar
        conversation={conversation}
        onRenameClick={onRenameClick}
        onAvatarClick={onAvatarClick}
        managementOpenSignal={managementOpenSignal}
      />
    )
  }

  return (
    <ChatInfoDirectSidebar conversation={conversation} onRenameClick={onRenameClick} onAvatarClick={onAvatarClick} />
  )
}
