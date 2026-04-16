import { useState } from 'react'
import { UserPlus, Users, Filter, MoreHorizontal, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationsQuery } from '../queries/use-queries'
import { useMarkAsReadMutation } from '../queries/use-mutations'
import { useAuth } from '@/features/auth'
import { MessageType, MessageStatus } from '@/constants/enum'
import { useChatText } from '../i18n/use-chat-text'
import { CreateGroupDialog } from './group/dialogs/create-group-dialog'
import { GroupAvatar } from '@/components/common/group-avatar'
import { UserAvatar } from '@/components/common/user-avatar'
import type { ConversationResponse } from '../schemas/chat.schema'
import { formatPreview } from '../utils/chat-preview'
import { getSystemMessagePreviewDisplay } from '../utils/system-message-preview'
import { formatMessageTime } from '@/utils/date'
import { getConversationDisplayName } from '../utils/group-name'
import { stripMentionsForPreview } from '../utils/mention'
import { SearchAndActions, type SearchAction } from '@/components/common/search-and-actions'
import { AddFriendSearchDialog } from '@/features/friend'

interface ChatSidebarProps {
  selectedChatId?: string
  onSelectChat: (chat: ConversationResponse) => void
}

export function ChatSidebar({ selectedChatId, onSelectChat }: ChatSidebarProps) {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false)
  const { text, t, i18n } = useChatText()
  const { user } = useAuth()
  const { data: conversations, isLoading, isError } = useConversationsQuery()
  const { mutate: markAsRead } = useMarkAsReadMutation()

  const handleSelectChat = (chat: ConversationResponse) => {
    onSelectChat(chat)
    if (chat.unreadCount && chat.unreadCount > 0) {
      markAsRead(chat.id)
    }
  }

  const getPreviewDisplay = (chat: ConversationResponse) => {
    if (!chat.lastMessage) return { text: '', showPromoteTargetIcon: false }

    if (chat.lastMessage.type === MessageType.System) {
      return getSystemMessagePreviewDisplay(
        chat.lastMessage.metadata,
        chat.lastMessage.senderId || undefined,
        chat.lastMessage.senderName || undefined,
        user?.id,
        chat.members || [],
        t
      )
    }

    return {
      text: formatPreview(
        {
          content: stripMentionsForPreview(chat.lastMessage.content),
          isFromMe: !!chat.lastMessage.isFromMe,
          senderName: chat.lastMessage.senderName || '',
          type: chat.lastMessage.type as MessageType,
          status: chat.lastMessage.status as MessageStatus
        },
        text
      ),
      showPromoteTargetIcon: false
    }
  }

  const headerActions: SearchAction[] = [
    {
      icon: UserPlus,
      onClick: () => setIsAddFriendModalOpen(true),
      title: text.sidebar.addFriend
    },
    {
      icon: Users,
      onClick: () => setIsCreateGroupModalOpen(true),
      title: text.sidebar.createGroup
    }
  ]

  return (
    <div className='w-[344px] flex flex-col border-r border-border bg-background shrink-0 h-full'>
      {/* Search and Quick Actions */}
      <div className='px-4 py-3 shrink-0'>
        <SearchAndActions placeholder={text.searchPlaceholder} actions={headerActions} />
      </div>

      {/* Filters Bar */}
      <div className='px-4 flex items-center justify-between border-b border-muted shrink-0'>
        <div className='flex items-center h-10'>
          <button className='h-full px-2 text-sm font-semibold text-primary border-b-2 border-primary'>
            {text.sidebar.all}
          </button>
          <button className='h-full px-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-all ml-2'>
            {text.sidebar.unread}
          </button>
        </div>
        <div className='flex items-center gap-1'>
          <button className='flex items-center gap-1 px-2 py-1 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors'>
            {text.sidebar.category}
            <Filter className='w-3 h-3' />
          </button>
          <button className='p-1.5 hover:bg-muted rounded-full text-text-secondary hover:text-text-primary transition-colors'>
            <MoreHorizontal className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className='flex-1 overflow-y-auto custom-scrollbar divide-y divide-muted/30'>
        {isLoading && <div className='p-4 text-center text-text-secondary text-sm'>{text.loading}</div>}
        {isError && <div className='p-4 text-center text-destructive text-sm'>{text.errors.loadConversations}</div>}

        {conversations?.map((chat: ConversationResponse) => {
          const previewDisplay = getPreviewDisplay(chat)
          const isSelected = selectedChatId === chat.id
          
          return (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={cn(
                'flex items-center h-[78px] px-4 cursor-pointer transition-colors group relative',
                isSelected ? 'bg-layer-selected' : 'hover:bg-muted/40'
              )}
            >
              <div className='relative shrink-0'>
                {chat.isGroup && !chat.avatar ? (
                  <GroupAvatar
                    avatars={chat.members?.map((m) => m.avatar) || []}
                    names={chat.members?.map((m) => m.fullName) || []}
                    count={chat.members?.length || 0}
                    size='lg'
                  />
                ) : (
                  <UserAvatar
                    src={chat.avatar}
                    name={getConversationDisplayName(chat, 'User', undefined, user?.id)}
                    className='w-[52px] h-[52px]'
                  />
                )}
                {chat.status === 'ONLINE' && !chat.isGroup && (
                  <div className='absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-background rounded-full' />
                )}
              </div>

              <div className='ml-3 flex-1 min-w-0 flex flex-col justify-center h-full'>
                <div className='flex items-center justify-between'>
                  <h3
                    className={cn(
                      'text-base truncate text-text-primary',
                      chat.unreadCount && chat.unreadCount > 0 ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {getConversationDisplayName(chat, 'Group', undefined, user?.id)}
                  </h3>
                  <span className='text-xs text-text-secondary whitespace-nowrap ml-2 font-normal'>
                    {chat.lastMessage?.timestamp ? formatMessageTime(chat.lastMessage.timestamp, i18n.language) : ''}
                  </span>
                </div>

                <div className='flex items-center justify-between mt-0.5'>
                  <p
                    className={cn(
                      'text-sm flex items-center gap-1 min-w-0 pr-4 truncate',
                      chat.unreadCount && chat.unreadCount > 0
                        ? 'text-text-primary font-medium'
                        : 'text-text-secondary font-normal'
                    )}
                  >
                    {previewDisplay.showPromoteTargetIcon && <Megaphone className='w-3.5 h-3.5 shrink-0 text-orange-500' />}
                    <span className='truncate'>{previewDisplay.text}</span>
                  </p>

                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className='flex items-center gap-1 shrink-0'>
                      {(() => {
                        const meta = chat.lastMessage?.metadata as Record<string, unknown> | null
                        const mentions = meta?.mentions as string[] | undefined
                        const isMentioned = mentions?.includes(user?.id || '')
                        const isCreate = meta?.action === 'CREATE_GROUP'
                        const isSystem = chat.lastMessage?.type === MessageType.System
                        
                        return (
                          <>
                            {isMentioned && (
                              <div className='bg-primary text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center'>@</div>
                            )}
                            {!isSystem && (
                              <div className='bg-destructive text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center'>
                                {chat.unreadCount > 5 ? '5+' : chat.unreadCount}
                              </div>
                            )}
                            {isSystem && isCreate && (
                              <div className='w-2 h-2 bg-destructive rounded-full mr-1' />
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Actions */}
              <div className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-md p-0.5 shadow-sm border border-border/40'>
                <button className='p-1.5 hover:bg-muted rounded transition-colors'>
                  <MoreHorizontal className='w-4 h-4 text-text-secondary' />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <CreateGroupDialog isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} />
      <AddFriendSearchDialog open={isAddFriendModalOpen} onOpenChange={setIsAddFriendModalOpen} />
    </div>
  )
}
