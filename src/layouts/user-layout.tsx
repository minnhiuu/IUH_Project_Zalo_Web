import { Outlet, Link, useLocation, useSearchParams } from 'react-router'
import { Users, Settings, MessageCircle, Search, Bell, Newspaper, Clapperboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { PATHS } from '@/constants/path'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { UserAvatar } from '@/components/common/user-avatar'
import { UserNavDropdown } from '@/features/user'
import { ChatProvider } from '@/features/chat/context/chat-context'
import { SearchPanel } from '@/features/search/user/components/search-panel'
import { NotificationPanel } from '@/features/notification/components/notification-panel'
import { useCommonText } from '@/locales/common/use-common-text'
import { cn } from '@/lib/utils'
import { useNotificationStateQuery } from '@/features/notification/queries/use-queries'
import { notificationKeys } from '@/features/notification/queries/keys'
import { NotificationOverlay } from '@/components/common/notification-overlay'
import { NewDeviceLoginModal } from '@/features/notification/components/new-device-login-modal'
import { QuickMessagesPill } from '@/features/social-feed/components/sidebar/quick-messages-pill'

export default function UserLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const commonText = useCommonText()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { data: notificationState } = useNotificationStateQuery()
  const unreadCount = notificationState?.notificationUnreadCount ?? notificationState?.unreadCount ?? 0

  // Adjust state during render to avoid cascading renders warning
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname)
    if (isSearchOpen) setIsSearchOpen(false)
    if (isNotificationOpen) setIsNotificationOpen(false)
    queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  }

  // Handle opening search from URL during render as well to avoid cascading renders
  const isSearchParamOpen = searchParams.get('search') === 'open'
  if (isSearchParamOpen && !isSearchOpen) {
    setIsSearchOpen(true)
  }

  useEffect(() => {
    if (isSearchOpen || isNotificationOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isSearchOpen, isNotificationOpen])

  const navItems = [
    { icon: MessageCircle, path: PATHS.HOME, label: commonText.text.nav.messages },
    { icon: Newspaper, path: PATHS.SOCIAL_FEED, label: commonText.text.nav.socialFeed },
    { icon: Clapperboard, path: PATHS.REELS, label: commonText.text.nav.reels },
    { icon: Search, path: PATHS.SEARCH, label: commonText.text.nav.search },
    { icon: Users, path: PATHS.CONTACTS, label: commonText.text.nav.friends },
    { icon: Bell, path: PATHS.NOTIFICATIONS, label: commonText.text.nav.notifications }
  ]

  const isChatPage =
    location.pathname === PATHS.HOME ||
    location.pathname === PATHS.CHAT.ROOT ||
    location.pathname.startsWith('/chat/c/') ||
    location.pathname.startsWith('/chat/u/')

  return (
    <ChatProvider>
      <div className='flex h-screen w-full overflow-hidden bg-background relative'>
        <nav
          className={cn(
            'w-16 bg-sidebar flex flex-col py-4 shrink-0 h-full transition-all duration-300 ease-in-out z-[110] border-r border-white/5',
            !isChatPage && 'hover:w-60 group/sidebar'
          )}
        >
          <UserNavDropdown dropdownWidth={240}>
            <div className='mb-6 cursor-pointer flex items-center px-3 w-full'>
              <div className='w-10 h-10 flex items-center justify-center rounded-lg transition-all data-[state=open]:bg-sidebar-accent group'>
                <UserAvatar
                  src={user?.avatar}
                  name={user?.fullName || 'User'}
                  className='h-8 w-8 border border-zinc-200 dark:border-white/10'
                  fallbackClassName='bg-primary text-white text-xs'
                />
              </div>
              <span className='ml-3 text-white font-bold text-[15px] truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden'>
                {user?.fullName || 'User'}
              </span>
            </div>
          </UserNavDropdown>

          <div className='flex-1 flex flex-col space-y-1 w-full px-2 overflow-y-auto no-scrollbar'>
            {navItems.map((item) => {
              if (item.path === PATHS.SEARCH) {
                const isActive = isSearchOpen
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsSearchOpen(true)
                      setIsNotificationOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-all duration-300 w-full group/item',
                      isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className={cn('w-6 h-6 shrink-0', isActive ? 'text-white' : 'text-white/70')} />
                    <span
                      className={cn(
                        'font-medium text-[15px] truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300',
                        isActive && 'font-bold'
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              }

              if (item.path === PATHS.NOTIFICATIONS) {
                const isActive = isNotificationOpen
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsNotificationOpen(true)
                      setIsSearchOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-all duration-300 w-full group/item relative',
                      isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className='relative shrink-0'>
                      <item.icon className={cn('w-6 h-6', isActive ? 'text-white' : 'text-white/70')} />
                      {unreadCount > 0 && (
                        <span className='absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white border-2 border-sidebar'>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'font-medium text-[15px] truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300',
                        isActive && 'font-bold'
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              }

              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setIsSearchOpen(false)
                    setIsNotificationOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group/item',
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className={cn('w-6 h-6 shrink-0', isActive ? 'text-white' : 'text-white/70')} />
                  <span
                    className={cn(
                      'font-medium text-[15px] truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300',
                      isActive && 'font-bold'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          <div className='mt-auto p-2 w-full'>
            <UserNavDropdown dropdownWidth={240} isSettings={true}>
              <button
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-300 w-full group/item text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Settings className='w-6 h-6 shrink-0' />
                <span className='font-medium text-[15px] truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300'>
                  {commonText.text.nav.settings}
                </span>
              </button>
            </UserNavDropdown>
          </div>
        </nav>

        <main className='flex-1 flex overflow-hidden'>
          <Outlet />
        </main>

        {/* Floating Quick Messages Pill */}
        <div className='fixed bottom-6 right-8 z-[100]'>
          <QuickMessagesPill />
        </div>

        <SearchPanel open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        <NotificationPanel open={isNotificationOpen} onOpenChange={setIsNotificationOpen} />
        <NotificationOverlay />
        <NewDeviceLoginModal />
      </div>
    </ChatProvider>
  )
}
