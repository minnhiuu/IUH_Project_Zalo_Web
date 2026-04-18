import { cn } from '@/lib/utils'
import { Users, UsersRound, UserPlus, Users2 } from 'lucide-react'
import { useFriendText } from '../i18n/use-friend-text'

export type ContactTab = 'friends' | 'groups' | 'friend-requests' | 'group-invites'

interface ContactSidebarProps {
  activeTab: ContactTab
  onTabChange: (tab: ContactTab) => void
  friendRequestCount?: number
}

export function ContactSidebar({ activeTab, onTabChange, friendRequestCount = 0 }: ContactSidebarProps) {
  const { text } = useFriendText()

  const menuItems = [
    {
      id: 'friends' as ContactTab,
      icon: Users,
      label: text.sidebar.friendList
    },
    {
      id: 'groups' as ContactTab,
      icon: UsersRound,
      label: text.sidebar.groupList
    },
    {
      id: 'friend-requests' as ContactTab,
      icon: UserPlus,
      label: text.sidebar.friendRequests,
      badge: friendRequestCount
    },
    {
      id: 'group-invites' as ContactTab,
      icon: Users2,
      label: text.sidebar.groupInvites
    }
  ]

  return (
    <div className='flex-1 flex flex-col bg-background shrink-0 h-full overflow-y-auto no-scrollbar'>
      <nav className='flex flex-col py-2'>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-4 px-4 h-[56px] mx-2 my-1 rounded-[6px] transition-colors text-left relative cursor-pointer',
                isActive
                  ? 'bg-(--layer-background-selected) text-text-primary'
                  : 'text-text-primary hover:bg-muted font-normal'
              )}
            >
              <item.icon className={cn('w-4.5 h-4.5', isActive ? 'text-text-primary' : 'text-text-secondary')} />
              <span className='flex-1 text-sm leading-6'>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className='bg-destructive text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] text-center flex items-center justify-center shrink-0'>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
