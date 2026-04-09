import { useState } from 'react'
import { Search, UserPlus, Users, Filter, MoreHorizontal, Megaphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useConversationsQuery } from '../queries/use-queries'
import { useMarkAsReadMutation } from '../queries/use-mutations'
import { useAuth } from '@/features/auth'
import { MessageType, MessageStatus } from '@/constants/enum'
import { useChatText } from '../i18n/use-chat-text'
import { CreateGroupDialog } from './group/dialogs/create-group-dialog'
import { GroupAvatar } from './group/group-avatar'
import { UserAvatar } from '@/components/common/user-avatar'
import type { ConversationResponse } from '../schemas/chat.schema'
import { formatPreview } from '../utils/chat-preview'
import { getSystemMessagePreviewDisplay } from '../utils/system-message-preview'
import { formatMessageTime } from '@/utils/date'
import { getConversationDisplayName } from '../utils/group-name'

interface ChatSidebarProps {
  selectedChatId?: string
  onSelectChat: (chat: ConversationResponse) => void
}

export function ChatSidebar({ selectedChatId, onSelectChat }: ChatSidebarProps) {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
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
          content: chat.lastMessage.content || '',
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

  return (
    <div className='w-[344px] flex flex-col border-r border-border bg-background shrink-0'>
      <div className='p-4 space-y-4'>
        <div className='flex items-center space-x-2'>
          <div className='relative flex-1 group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
            <Input
              placeholder={text.searchPlaceholder}
              className='pl-10 h-8 bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 text-sm rounded-[4px]'
            />
          </div>
          <button className='p-1.5 hover:bg-muted rounded-full transition-colors' title={text.sidebar.addFriend}>
            <UserPlus className='w-5 h-5 text-muted-foreground' />
          </button>
          <button
            className='p-1.5 hover:bg-muted rounded-full transition-colors'
            onClick={() => setIsCreateGroupModalOpen(true)}
            title={text.sidebar.createGroup}
          >
            <Users className='w-5 h-5 text-muted-foreground' />
          </button>
        </div>

        <div className='flex items-center justify-between text-[13px] font-medium'>
          <div className='flex items-center space-x-4'>
            <button className='text-primary border-b-2 border-primary pb-1'>{text.sidebar.all}</button>
            <button className='text-muted-foreground hover:text-foreground pb-1'>{text.sidebar.unread}</button>
          </div>
          <div className='flex items-center space-x-2 text-muted-foreground'>
            <button className='flex items-center hover:text-foreground'>
              {text.sidebar.category} <Filter className='w-3 h-3 ml-1 outline-none border-none' />
            </button>
            <button className='hover:text-foreground'>
              <MoreHorizontal className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar shadow-none border-none'>
        {isLoading && <div className='p-4 text-center text-muted-foreground'>{text.loading}</div>}
        {isError && <div className='p-4 text-center text-destructive'>{text.errors.loadConversations}</div>}

        {conversations?.map((chat: ConversationResponse) => {
          const previewDisplay = getPreviewDisplay(chat)

          return (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors',
                selectedChatId === chat.id && 'bg-muted'
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
                    className='w-12 h-12'
                  />
                )}
                {chat.status === 'ONLINE' && (
                  <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full' />
                )}
              </div>
              <div className='ml-3 flex-1 min-w-0 pr-2'>
                <div className='flex items-center justify-between mb-0.5'>
                  <h3
                    className={cn(
                      'text-[15px] truncate text-foreground/90',
                      chat.unreadCount && chat.unreadCount > 0 ? 'font-bold' : 'font-medium'
                    )}
                  >
                    {getConversationDisplayName(chat, 'Group', undefined, user?.id)}
                  </h3>
                  <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                    {chat.lastMessage?.timestamp ? formatMessageTime(chat.lastMessage.timestamp, i18n.language) : ''}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <p
                    className={cn(
                      'text-[13px] flex items-center gap-1 min-w-0',
                      chat.unreadCount && chat.unreadCount > 0
                        ? 'text-foreground font-semibold'
                        : chat.lastMessage?.type === 'SYSTEM_FRIENDSHIP_BADGE' ||
                            chat.lastMessage?.type === 'SYSTEM_FRIENDSHIP_CARD'
                          ? 'text-vibrant-blue font-medium'
                          : 'text-muted-foreground font-normal'
                    )}
                  >
                    {previewDisplay.showPromoteTargetIcon && <Megaphone className='w-3.5 h-3.5 shrink-0' />}
                    <span className='truncate'>{previewDisplay.text}</span>
                  </p>
                  {chat.unreadCount && chat.unreadCount > 0 ? (
                    (chat.lastMessage?.metadata as Record<string, unknown> | null)?.action === 'CREATE_GROUP' ? (
                      <div className='bg-red-500 rounded-full w-2.5 h-2.5 ml-2 shrink-0' />
                    ) : chat.lastMessage?.type !== MessageType.System ? (
                      <div className='bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px] ml-2 shrink-0'>
                        {chat.unreadCount > 5 ? '5+' : chat.unreadCount}
                      </div>
                    ) : null
                  ) : null}
                </div>
              </div>
              <div className='absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1'>
                <button className='p-1 hover:bg-background rounded-md shadow-sm'>
                  <MoreHorizontal className='w-4 h-4 text-muted-foreground' />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <CreateGroupDialog isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} />
    </div>
  )
}
