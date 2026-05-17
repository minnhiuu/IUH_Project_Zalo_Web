import { useConversationsQuery } from '@/features/chat/queries/use-queries'
import { UserAvatar } from '@/components/common/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSocialText } from '../../i18n/use-social-text'
import { formatDistanceToNow } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import type { ConversationResponse } from '@/features/chat/schemas/chat.schema'
import { getConversationDisplayName } from '@/features/chat/utils/group-name'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { GroupAvatar } from '@/components/common/group-avatar'
import { useChatText } from '@/features/chat/i18n/use-chat-text'
import { formatPreview } from '@/features/chat/utils/chat-preview'
import { getSystemMessagePreviewDisplay } from '@/features/chat/utils/system-message-preview'
import { stripMentionsForPreview } from '@/features/chat/utils/mention'
import { MessageType, MessageStatus } from '@/constants/enum'
import { cn } from '@/lib/utils'

export function MiniConversationList({ 
  searchQuery, 
  onSelect 
}: { 
  searchQuery: string, 
  onSelect: (chat: ConversationResponse) => void 
}) {
  const { text: socialText, language } = useSocialText()
  const { text: chatText, t: chatT } = useChatText()
  const { user } = useAuth()
  const { data: conversations, isLoading } = useConversationsQuery()
  
  const dateLocale = language === 'vi' ? vi : enUS

  const getPreviewDisplay = (chat: ConversationResponse) => {
    if (!chat.lastMessage) return { text: '', showPromoteTargetIcon: false }

    if (chat.lastMessage.type === MessageType.System) {
      return getSystemMessagePreviewDisplay(
        chat.lastMessage.metadata,
        chat.lastMessage.senderId || undefined,
        chat.lastMessage.senderName || undefined,
        user?.id,
        chat.members || [],
        chatT
      )
    }

    return {
      text: formatPreview(
        {
          content: stripMentionsForPreview(chat.lastMessage.content),
          isFromMe: !!chat.lastMessage.isFromMe,
          isGroup: chat.isGroup,
          senderName: chat.lastMessage.senderName || '',
          type: chat.lastMessage.type as MessageType,
          status: chat.lastMessage.status as MessageStatus
        },
        chatText
      ),
      showPromoteTargetIcon: false
    }
  }

  if (isLoading) {
    return (
      <div className='p-4 space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const filtered = (conversations || []).filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filtered.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <p className='text-zinc-500 text-[14px]'>{socialText.miniChat.noConversations}</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col'>
      {filtered.map((conv) => (
        <div 
          key={conv.id}
          onClick={() => onSelect(conv)}
          className='flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group'
        >
          <div className='relative shrink-0'>
            {conv.isGroup && !conv.avatar ? (
              <GroupAvatar
                avatars={conv.members?.map((m) => m.avatar) || []}
                names={conv.members?.map((m) => m.fullName) || []}
                count={conv.members?.length || 0}
                size='md'
                className='h-12 w-12 bg-transparent'
              />
            ) : (
              <UserAvatar 
                src={conv.avatar} 
                name={getConversationDisplayName(conv, conv.isGroup ? 'Group' : 'User', undefined, user?.id)} 
                className='h-12 w-12 border border-zinc-100 dark:border-zinc-800' 
              />
            )}
            {conv.status === 'ONLINE' && (
              <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full' />
            )}
          </div>
          <div className='flex-1 min-w-0 flex flex-col justify-center'>
            <div className='flex items-center justify-between gap-2'>
              <span className={cn('text-[15px] truncate transition-colors', (conv.unreadCount || 0) > 0 ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-900 dark:text-white')}>
                {getConversationDisplayName(conv, conv.isGroup ? 'Group' : 'User', undefined, user?.id)}
              </span>
              {conv.lastMessage?.timestamp && (
                <span className={cn('text-[12px] whitespace-nowrap', (conv.unreadCount || 0) > 0 ? 'font-medium text-zinc-900 dark:text-zinc-300' : 'text-zinc-400')}>
                  {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: false, locale: dateLocale })}
                </span>
              )}
            </div>
            <div className='flex items-center justify-between gap-2 mt-0.5'>
              <p className={cn('text-[13px] truncate', (conv.unreadCount || 0) > 0 ? 'font-bold text-zinc-900 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400')}>
                {getPreviewDisplay(conv).text}
              </p>
              {(conv.unreadCount || 0) > 0 && (
                <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white shadow-sm shrink-0'>
                  {conv.unreadCount! > 99 ? '99+' : conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
