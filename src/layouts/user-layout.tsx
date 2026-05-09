import { useQueryClient } from '@tanstack/react-query'
import { Outlet, Link, useLocation, useSearchParams } from 'react-router'
import { Contact2, CheckSquare, Settings, Cloud, Briefcase, MessageCircle, Search, Bell, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants/path'
import { UserNavDropdown } from '@/features/user'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { UserAvatar } from '@/components/common/user-avatar'
import { useState, useCallback, useEffect } from 'react'
import { SearchPanel } from '@/features/search'
import { useCommonText } from '@/locales/common/use-common-text'
import { useFCM } from '@/hooks/use-fcm'
import { NotificationPanel, useNotificationSocket } from '@/features/notification'
import { NotificationOverlay } from '@/components/common/notification-overlay'
import { useMySettings } from '@/features/user-settings/queries/use-settings'
import { NewDeviceLoginModal } from '@/features/notification/components/new-device-login-modal'
import { notificationKeys } from '@/features/notification/queries/keys'
import { useMarkHistoryAsCheckedMutation } from '@/features/notification/queries/use-mutations'
import { useNotificationHandler } from '@/hooks/use-notification-handler'
import { ChatProvider } from '@/features/chat'

import { socialFeedKeys } from '@/features/social-feed/queries/keys'
import { showWarningToast } from '@/utils/toast'
import { useLocale } from '@/lib/i18n/use-locale'
import type { SocialPost } from '@/features/social-feed/components/post/post-card'
import type { InfiniteData } from '@tanstack/react-query'

export default function UserLayout() {
  const location = useLocation()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false)

  useNotificationSocket()
  const { systemUnreadCount } = useNotificationHandler()

  const { mutate: markAsChecked } = useMarkHistoryAsCheckedMutation()
  const { data: settings } = useMySettings()
  const { locale, changeLocale } = useLocale()

  // Sync language from user settings globally
  useEffect(() => {
    if (settings?.generalSettings?.languageEn !== undefined) {
      const settingsLang = settings.generalSettings.languageEn ? 'en' : 'vi'
      if (locale !== settingsLang) {
        changeLocale(settingsLang)
      }
    }
  }, [settings?.generalSettings?.languageEn, locale, changeLocale])

  const { text: commonText } = useCommonText()
  const [searchParams, setSearchParams] = useSearchParams()

  const unreadDisplay = systemUnreadCount

  useEffect(() => {
    if (searchParams.get('noti_open') === 'true') {
      setTimeout(() => {
        setIsNotificationOpen(true)
        setIsSearchOpen(false)
        markAsChecked()
        window.dispatchEvent(new CustomEvent('notification:marked-as-read'))

        const newParams = new URLSearchParams(searchParams)
        newParams.delete('noti_open')
        setSearchParams(newParams, { replace: true })
      }, 0)
    }
  }, [searchParams, setSearchParams, markAsChecked])

  const handleFCMMessage = useCallback(
    (payload: unknown) => {
      const data = (payload as { data?: Record<string, string> })?.data
      const type = data?.type

      if (type === 'CONTENT_REMOVED' || type === 'CONTENT_HIDDEN') {
        const postId = data?.referenceId
        if (postId) {
          queryClient.setQueriesData<InfiniteData<SocialPost[]>>({ queryKey: socialFeedKeys.all }, (old) => {
            if (!old?.pages) return old
            return {
              ...old,
              pages: old.pages.map((page) => page.filter((post) => post.id !== postId))
            }
          })
        }
        showWarningToast(
          data?.body ||
            (type === 'CONTENT_REMOVED'
              ? 'Your content was removed for violating community guidelines.'
              : 'Your content was hidden for violating community guidelines.'),
          6000
        )
      } else if (type === 'USER_WARNED') {
        const targetType = data?.targetType
        const adminNote = data?.adminNote
        let message = data?.body || 'You received a warning from an administrator.'
        if (targetType && !data?.body) {
          message = `You received a warning about your ${targetType} from an administrator.`
        }
        if (adminNote) {
          message += ` Note: ${adminNote}`
        }
        showWarningToast(message, 8000)
      } else if (type === 'NEW_DEVICE_LOGIN') {
        const payloadData = data?.payload ? JSON.parse(data.payload) : data
        window.dispatchEvent(
          new CustomEvent('open-new-device-login-modal', {
            detail: {
              deviceName: payloadData.deviceName || '',
              ipAddress: payloadData.ipAddress || '',
              loginTime: payloadData.loginTime || '',
              sessionId: payloadData.sessionId || ''
            }
          })
        )
      }
    },
    [queryClient]
  )

  useFCM(handleFCMMessage, () => {
    setIsNotificationOpen(true)
    setIsSearchOpen(false)
    markAsChecked()
    window.dispatchEvent(new CustomEvent('notification:marked-as-read'))
    queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  })

  const navItems = [
    { icon: MessageCircle, path: PATHS.HOME, label: commonText.nav.messages },
    { icon: Newspaper, path: PATHS.SOCIAL_FEED, label: commonText.nav.socialFeed },
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
    <ChatProvider>
      <div className='flex h-screen w-full overflow-hidden bg-background'>
        <nav className='w-16 bg-sidebar flex flex-col items-center py-4 shrink-0 h-full'>
          <UserNavDropdown>
            <div className='mb-4 cursor-pointer flex justify-center w-full'>
              <div className='w-12 h-12 flex items-center justify-center rounded-lg transition-all data-[state=open]:bg-sidebar-accent group'>
                <UserAvatar
                  src={user?.avatar}
                  name={user?.fullName || 'User'}
                  className='h-10 w-10 border border-zinc-200 dark:border-white/10'
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
                        'w-[22px] h-[22px] transition-colors',
                        isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                      )}
                    />
                  </button>
                )
              }
              if (item.path === PATHS.NOTIFICATIONS) {
                const isActive = isNotificationOpen
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      const nextState = !isNotificationOpen
                      setIsNotificationOpen(nextState)
                      setIsSearchOpen(false)
                      if (nextState) {
                        markAsChecked()
                        window.dispatchEvent(new CustomEvent('notification:marked-as-read'))
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
                        'w-[22px] h-[22px] transition-colors',
                        isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                      )}
                    />
                    {unreadDisplay > 0 && (
                      <span className='absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white ring-2 ring-sidebar'>
                        {unreadDisplay > 99 ? '99+' : unreadDisplay}
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
                          'w-[26px] h-[26px] transition-colors',
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
                      'w-[26px] h-[26px] transition-colors',
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
          <Outlet context={{ setIsGlobalSearchOpen, isGlobalSearchOpen }} />
        </main>

        <SearchPanel open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        <NotificationPanel open={isNotificationOpen} onOpenChange={setIsNotificationOpen} />
        <NotificationOverlay />
        <NewDeviceLoginModal />
      </div>
    </ChatProvider>
  )
}
