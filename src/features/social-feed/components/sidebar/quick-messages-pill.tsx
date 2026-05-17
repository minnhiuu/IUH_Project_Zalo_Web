import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useLocation } from 'react-router'
import { UserAvatar } from '@/components/common/user-avatar'
import { useConversationsQuery } from '@/features/chat/queries/use-queries'
import { PATHS } from '@/constants/path'
import { useSocialText } from '../../i18n/use-social-text'
import { MiniChatWindow } from '@/features/social-feed/components/mini-chat/mini-chat-window'
import { getConversationDisplayName } from '@/features/chat/utils/group-name'
import { GroupAvatar } from '@/components/common/group-avatar'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { CustomTooltip } from '@/components/common/custom-tooltip'
import { useNotificationStateQuery } from '@/features/notification/queries/use-queries'

export function QuickMessagesPill() {
  const [isOpen, setIsOpen] = useState(false)
  const { text } = useSocialText()
  const location = useLocation()
  const { user } = useAuth()
  const { data: conversations, isLoading } = useConversationsQuery()
  
  const { data: notificationState } = useNotificationStateQuery()
  const unreadCount = notificationState?.chatUnreadConversationCount ?? 0

  // Show on social feed or reels
  const isSocialPage = location.pathname.startsWith(PATHS.SOCIAL_FEED)
  const isReelsPage = location.pathname.startsWith(PATHS.REELS)
  const isChatPage = location.pathname.startsWith(PATHS.CHAT.ROOT)

  if (isChatPage || (!isSocialPage && !isReelsPage)) return null
  if (isLoading || !conversations || conversations.length === 0) return null

  // Prioritize unread conversations, otherwise show the latest 1 active conv
  const unreadConvs = conversations.filter((c) => (c.unreadCount || 0) > 0)
  const recentConvs = unreadConvs.length > 0 ? unreadConvs.slice(0, 1) : conversations.slice(0, 1)

  return (
    <div className='relative'>
      {isOpen && (
        <div className='absolute bottom-0 right-0 z-[110]'>
          <MiniChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-100 dark:border-zinc-800 rounded-[32px] cursor-pointer hover:scale-105 active:scale-95 transition-all mt-4 group min-w-[180px]'
      >
        <div className='flex items-center gap-3'>
          <div className='p-1 relative'>
            <MessageCircle className='w-6 h-6 text-zinc-900 dark:text-zinc-100' />
            {unreadCount > 0 && (
              <span className='absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className='text-[15px] font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-zinc-900 dark:group-hover:text-white'>
            {text.miniChat.title}
          </span>
        </div>
        <div className='flex ml-3'>
          {recentConvs.map((conv) => (
            <CustomTooltip
              key={conv.id}
              content={getConversationDisplayName(conv, conv.isGroup ? 'Group' : 'User', undefined, user?.id)}
              position='top'
              className='z-20'
            >
              <div className='relative h-9 w-9'>
                {conv.isGroup && !conv.avatar ? (
                  <GroupAvatar
                    avatars={conv.members?.map((m) => m.avatar) || []}
                    names={conv.members?.map((m) => m.fullName) || []}
                    count={conv.members?.length || 0}
                    size='sm'
                    className='h-9 w-9 bg-zinc-100 dark:bg-zinc-800 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm overflow-hidden'
                  />
                ) : (
                  <UserAvatar
                    src={conv.avatar}
                    name={getConversationDisplayName(conv, conv.isGroup ? 'Group' : 'User', undefined, user?.id)}
                    className='h-9 w-9 border-2 border-white dark:border-zinc-900 shadow-sm'
                  />
                )}
              </div>
            </CustomTooltip>
          ))}
        </div>
      </div>
    </div>
  )
}
