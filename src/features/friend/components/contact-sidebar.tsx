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
    <div className='w-[300px] flex flex-col border-r border-border bg-background shrink-0 h-full'>
      <nav className='flex flex-col p-2'>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className='flex-1 text-[15px]'>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className='bg-destructive text-destructive-foreground text-xs font-medium rounded-full px-2 py-0.5 min-w-[20px] text-center'>
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
