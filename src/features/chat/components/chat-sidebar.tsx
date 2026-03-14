import { Search, UserPlus, Users, Filter, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useConversationsQuery } from '../queries/use-queries'
import { useChatText } from '../i18n/use-chat-text'
import type { ConversationResponse } from '../schemas/chat.schema'

interface ChatSidebarProps {
  selectedChatId?: string
  onSelectChat: (chat: ConversationResponse) => void
}

export function ChatSidebar({ selectedChatId, onSelectChat }: ChatSidebarProps) {
  const { text } = useChatText()
  const { data: conversations, isLoading, isError } = useConversationsQuery()

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
          <button className='p-1.5 hover:bg-muted rounded-full transition-colors'>
            <UserPlus className='w-5 h-5 text-muted-foreground' />
          </button>
          <button className='p-1.5 hover:bg-muted rounded-full transition-colors'>
            <Users className='w-5 h-5 text-muted-foreground' />
          </button>
        </div>

        <div className='flex items-center justify-between text-[13px] font-medium'>
          <div className='flex items-center space-x-4'>
            <button className='text-primary border-b-2 border-primary pb-1'>Tất cả</button>
            <button className='text-muted-foreground hover:text-foreground pb-1'>Chưa đọc</button>
          </div>
          <div className='flex items-center space-x-2 text-muted-foreground'>
            <button className='flex items-center hover:text-foreground'>
              Phân loại <Filter className='w-3 h-3 ml-1 outline-none border-none' />
            </button>
            <button className='hover:text-foreground'>
              <MoreHorizontal className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar shadow-none border-none'>
        {isLoading && <div className='p-4 text-center text-muted-foreground'>Đang tải...</div>}
        {isError && <div className='p-4 text-center text-destructive'>{text.errors.loadConversations}</div>}
        
        {conversations?.map((chat: ConversationResponse) => (
          <div
            key={chat.chatId}
            onClick={() => onSelectChat(chat)}
            className={cn(
              'flex items-center px-4 py-3 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors relative group',
              selectedChatId === chat.chatId && 'bg-muted'
            )}
          >
            <div className='relative shrink-0'>
              <img
                src={chat.partnerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${chat.partnerId}`}
                alt={chat.partnerName || 'User'}
                className='w-12 h-12 rounded-full object-cover border border-black/5'
              />
              {chat.partnerStatus === 'ONLINE' && (
                <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full' />
              )}
            </div>
            <div className='ml-3 flex-1 min-w-0 pr-2'>
              <div className='flex items-center justify-between mb-0.5'>
                <h3 className='text-[15px] font-medium truncate text-foreground/90'>{chat.partnerName}</h3>
                <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                  {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-[13px] text-muted-foreground truncate font-normal'>{chat.lastMessage}</p>
                {/* 
                  if chat hasUnread or similar
                */}
              </div>
            </div>
            <div className='absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1'>
              <button className='p-1 hover:bg-background rounded-md shadow-sm'>
                <MoreHorizontal className='w-4 h-4 text-muted-foreground' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
