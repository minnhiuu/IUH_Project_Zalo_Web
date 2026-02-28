import { useQueryClient } from '@tanstack/react-query'
import { Outlet, Link, useLocation } from 'react-router'
import { Contact2, CheckSquare, Settings, Cloud, Briefcase, MessageCircle, Search, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants/path'
import { UserNavDropdown } from '@/features/user'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { UserAvatar } from '@/components/common/user-avatar'
import { useState } from 'react'
import { SearchPanel } from '@/features/search-user'
import { useCommonText } from '@/locales/common/use-common-text'
import { useFCM } from '@/hooks/use-fcm'
import { NotificationPanel } from '@/features/notification'
import { notificationKeys } from '@/features/notification/queries/keys'
import { useNotificationStateQuery } from '@/features/notification/queries/use-queries'
import { useMarkHistoryAsCheckedMutation } from '@/features/notification/queries/use-mutations'

export default function UserLayout() {
  const location = useLocation()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const { data: notificationState } = useNotificationStateQuery()
  const { mutate: markAsChecked } = useMarkHistoryAsCheckedMutation()

  const { text: commonText } = useCommonText()

  useFCM()

  const navItems = [
    { icon: MessageCircle, path: PATHS.HOME, label: commonText.nav.messages },
    { icon: Search, path: PATHS.SEARCH, label: commonText.nav.search },
    { icon: Contact2, path: PATHS.CONTACTS, label: commonText.nav.contacts },
    { icon: CheckSquare, path: PATHS.TODO, label: commonText.nav.todo },
    { icon: Bell, path: PATHS.NOTIFICATIONS, label: commonText.nav.notifications }
  ]

  const bottomItems = [
    { icon: Cloud, path: PATHS.CLOUD, label: commonText.nav.cloud },
    { icon: Briefcase, path: PATHS.BUSINESS, label: commonText.nav.business },
    { icon: Settings, path: PATHS.USER.SETTINGS, label: commonText.nav.settings }
  ]

  return (
    <div className='flex h-screen w-full overflow-hidden bg-background'>
      <nav className='w-16 bg-sidebar flex flex-col items-center py-4 shrink-0 z-60 relative h-full'>
        <UserNavDropdown>
          <div className='mb-4 cursor-pointer flex justify-center w-full'>
            <div className='w-12 h-12 flex items-center justify-center rounded-lg transition-all data-[state=open]:bg-sidebar-accent group'>
              <UserAvatar
                src={user?.avatar}
                name={user?.fullName || 'User'}
                className='w-10 h-10 border border-white/20 transition-transform group-hover:scale-105 active:scale-95'
                fallbackClassName='bg-primary text-white text-sm'
              />
            </div>
          </div>
        </UserNavDropdown>

        <div className='flex flex-col space-y-2 w-full'>
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
                    'flex items-center justify-center w-[48px] h-[48px] rounded-lg transition-all mx-auto group relative mb-1',
                    isActive ? 'bg-sidebar-accent' : 'hover:bg-white/10'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-[24px] h-[24px] transition-colors',
                      isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                    )}
                  />
                </button>
              )
            }
            if (item.path === PATHS.NOTIFICATIONS) {
              const isActive = isNotificationOpen
              const unreadCount = notificationState?.unreadCount ?? 0
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    const nextState = !isNotificationOpen
                    setIsNotificationOpen(nextState)
                    setIsSearchOpen(false)
                    if (nextState) {
                      markAsChecked()
                    }
                    queryClient.invalidateQueries({ queryKey: notificationKeys.all })
                  }}
                  className={cn(
                    'flex items-center justify-center w-[48px] h-[48px] rounded-lg transition-all mx-auto group relative mb-1',
                    isActive ? 'bg-sidebar-accent' : 'hover:bg-white/10'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-[24px] h-[24px] transition-colors',
                      isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                    )}
                  />
                  {unreadCount > 0 && (
                    <span className='absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white ring-2 ring-sidebar'>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              )
            }
            const isActive = location.pathname === item.path && !isSearchOpen
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  setIsSearchOpen(false)
                  setIsNotificationOpen(false)
                }}
                className={cn(
                  'flex items-center justify-center w-[48px] h-[48px] rounded-lg transition-all mx-auto group relative mb-1',
                  isActive ? 'bg-sidebar-accent' : 'hover:bg-white/10'
                )}
              >
                <item.icon
                  className={cn(
                    'w-[24px] h-[24px] transition-colors',
                    isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                  )}
                />
              </Link>
            )
          })}
        </div>

        <div className='mt-auto flex flex-col space-y-2 w-full'>
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path
            if (item.path === PATHS.USER.SETTINGS) {
              return (
                <UserNavDropdown key={item.path} dropdownWidth={240}>
                  <button
                    className={cn(
                      'flex items-center justify-center w-[48px] h-[48px] rounded-lg transition-all mx-auto group relative mb-1 data-[state=open]:bg-sidebar-accent',
                      isActive ? 'bg-sidebar-accent' : 'hover:bg-white/10'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                      )}
                    />
                  </button>
                </UserNavDropdown>
              )
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSearchOpen(false)}
                className={cn(
                  'flex items-center justify-center w-[48px] h-[48px] rounded-lg transition-all mx-auto group relative mb-1',
                  isActive ? 'bg-sidebar-accent' : 'hover:bg-white/10'
                )}
              >
                <item.icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                  )}
                />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className='flex-1 flex overflow-hidden'>
        <Outlet />
      </main>

      <SearchPanel open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <NotificationPanel open={isNotificationOpen} onOpenChange={setIsNotificationOpen} />
    </div>
  )
}
