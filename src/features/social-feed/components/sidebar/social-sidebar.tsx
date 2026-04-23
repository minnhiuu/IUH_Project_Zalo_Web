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
    <aside className='hidden w-[280px] shrink-0 xl:block 2xl:w-[360px] pl-2'>
      <div className='sticky top-0 pb-10'>
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

        <div className='mt-2 border-t border-zinc-300 dark:border-white/10 mx-2 pt-2'>
          <div className='flex items-center justify-between px-2 py-2'>
            <h3 className='text-[15px] font-semibold text-zinc-500 dark:text-[#b0b3b8]'>Lối tắt của bạn</h3>
          </div>
          <div className='grid gap-1'>
            <Link
              to='#'
              className='group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
            >
              <div className='h-9 w-9 overflow-hidden rounded-lg'>
                <img src='https://cdn.haitrieu.com/wp-content/uploads/2022/11/Logo-Truong-Dai-hoc-Cong-nghiep-TPHCM-IUH.png' alt='IUH' className='h-full w-full object-cover bg-white' />
              </div>
              <span className='text-[15px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-[#ececec] transition-colors line-clamp-2'>
                IUH - Đại học Công nghiệp TP. Hồ Chí Minh
              </span>
            </Link>
            <Link
              to='#'
              className='group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
            >
              <div className='h-9 w-9 overflow-hidden rounded-lg'>
                <img src='https://play-lh.googleusercontent.com/eun_G0a0n62e5k_Iav9i4T3nL1rN55N6h9_uI455q0s6N_5V2_zP4_s7R_56s9Vw8w=w240-h480-rw' alt='8 Ball Pool' className='h-full w-full object-cover' />
              </div>
              <span className='text-[15px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-[#ececec] transition-colors'>
                8 Ball Pool
              </span>
            </Link>
          </div>
        </div>

        <div className='mt-4 px-4 text-[12px] font-medium text-zinc-500 dark:text-[#b0b3b8] flex flex-wrap gap-x-1.5 gap-y-1'>
          <a href='#' className='hover:underline'>Quyền riêng tư</a> · 
          <a href='#' className='hover:underline'>Điều khoản</a> · 
          <a href='#' className='hover:underline'>Quảng cáo</a> · 
          <a href='#' className='hover:underline'>Lựa chọn quảng cáo</a> · 
          <a href='#' className='hover:underline'>Cookie</a> · 
          <a href='#' className='hover:underline'>Xem thêm</a> · 
          <span>Meta © {new Date().getFullYear()}</span>
        </div>
      </div>
    </aside>
  )
}
