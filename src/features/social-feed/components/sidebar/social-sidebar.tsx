import { Users, Users2, Bookmark, Clock, Clapperboard } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { UserAvatar } from '@/components/common/user-avatar'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { PATHS } from '@/constants/path'
import { useSocialText } from '../../i18n/use-social-text'
import { cn } from '@/lib/utils'
import { QuickMessagesPill } from './quick-messages-pill'

export function SocialSidebar() {
  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const location = useLocation()

  const currentUserLabel = text.composer.me
  const profileName = myProfile?.fullName?.trim() || currentUserLabel
  const profileAvatar = myProfile?.avatar || undefined

  const currentTab = new URLSearchParams(location.search).get('tab') || 'feed'

  const shortcuts = [
    {
      id: 'feed',
      icon: Users,
      label: text.sidebar.friends,
      path: PATHS.SOCIAL_FEED
    },
    {
      id: 'groups',
      icon: Users2,
      label: text.sidebar.groups,
      path: PATHS.SOCIAL_FEED
    },
    {
      id: 'reels',
      icon: Clapperboard,
      label: text.sidebar.reels,
      path: `${PATHS.SOCIAL_FEED}?tab=reels`
    },
    {
      id: 'saved',
      icon: Bookmark,
      label: text.sidebar.saved,
      path: PATHS.SOCIAL_FEED
    },
    {
      id: 'memories',
      icon: Clock,
      label: text.sidebar.memories,
      path: PATHS.SOCIAL_FEED
    }
  ]

  return (
    <div className='w-full space-y-4'>
      <Link to={PATHS.USER.PROFILE} className='flex items-center justify-between group'>
        <div className='flex items-center gap-4'>
          <div className='h-12 w-12 shrink-0'>
            <UserAvatar
              name={profileName}
              src={profileAvatar}
              className='w-full h-full border border-background shadow-sm'
              fallbackClassName='bg-primary text-white text-sm'
            />
          </div>
          <div className='flex flex-col min-w-0'>
            <span className='text-[14px] font-bold text-text-primary truncate group-hover:underline'>
              {profileName}
            </span>
            <span className='text-[13px] text-text-secondary truncate'>{currentUserLabel}</span>
          </div>
        </div>
        <button className='text-[12px] font-bold text-[#0068ff] hover:text-blue-700 transition-colors'>Chuyển</button>
      </Link>

      <div className='flex flex-col gap-0.5 pt-2'>
        {shortcuts.map((item) => {
          const isActive = currentTab === item.id
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center gap-3 py-2 px-1 rounded-md transition-colors text-left relative cursor-pointer group',
                isActive ? 'font-semibold' : 'hover:bg-muted/50'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                )}
              />
              <span
                className={cn(
                  'flex-1 text-[13px] leading-tight truncate',
                  isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Quick Messages Pill */}
      <QuickMessagesPill />
    </div>
  )
}
