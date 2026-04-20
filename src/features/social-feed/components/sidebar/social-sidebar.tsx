import { Users, Users2, Bookmark, Clock, Clapperboard } from 'lucide-react'
import { Link } from 'react-router'
import { UserAvatar } from '@/components/common/user-avatar'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { PATHS } from '@/constants/path'
import { useSocialText } from '../../i18n/use-social-text'

export function SocialSidebar() {
  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const currentUserLabel = text.composer.me
  const profileName = myProfile?.fullName?.trim() || currentUserLabel
  const profileAvatar = myProfile?.avatar || undefined

  const shortcuts = [
    { icon: Users, label: text.sidebar.friends, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Users2, label: text.sidebar.groups, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { icon: Clapperboard, label: text.sidebar.reels, color: 'text-rose-500', bg: 'bg-rose-500/10', path: PATHS.REELS },
    { icon: Bookmark, label: text.sidebar.saved, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: Clock, label: text.sidebar.memories, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ]

  return (
    <aside className='hidden w-70 shrink-0 xl:block'>
      <div className='sticky top-0 space-y-4 pb-10'>
        <Link
          to={PATHS.USER.PROFILE}
          className='flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
        >
          <div className='h-10 w-10'>
            <UserAvatar
              name={profileName}
              src={profileAvatar}
              className='w-full h-full border border-background'
              fallbackClassName='bg-primary text-white text-sm'
            />
          </div>
          <span className='text-[15px] font-semibold text-zinc-900 dark:text-[#ececec]'>{profileName}</span>
        </Link>

        <div className='grid gap-1 pt-2'>
          {shortcuts.map((item, i) => {
            const content = (
              <>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 group-hover:${item.bg} transition-colors`}
                >
                  <item.icon
                    className={`h-5 w-5 text-zinc-500 dark:text-zinc-400 group-hover:${item.color} transition-colors`}
                  />
                </div>
                <span className='text-[15px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-[#ececec] transition-colors'>
                  {item.label}
                </span>
              </>
            )

            if (item.path) {
              return (
                <Link
                  key={i}
                  to={item.path}
                  className='group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={i}
                className='group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
              >
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
