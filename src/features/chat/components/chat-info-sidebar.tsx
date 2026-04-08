import type { ConversationResponse } from '../schemas/chat.schema'
import { ChatInfoGroupSidebar } from './group/chat-info-group-sidebar'
import { ChatInfoDirectSidebar } from './chat-info-direct-sidebar'

interface ChatInfoSidebarProps {
  conversation: ConversationResponse
  onRenameClick?: () => void
  onAvatarClick?: () => void
  onManagementClick?: () => void
}

export function ChatInfoSidebar({ conversation, onRenameClick, onAvatarClick }: ChatInfoSidebarProps) {
  if (conversation.isGroup) {
    return (
      <ChatInfoGroupSidebar conversation={conversation} onRenameClick={onRenameClick} onAvatarClick={onAvatarClick} />
    )
  }

  return (
    <ChatInfoDirectSidebar conversation={conversation} onRenameClick={onRenameClick} onAvatarClick={onAvatarClick} />
  )
}
