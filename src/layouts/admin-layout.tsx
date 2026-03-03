import { Outlet, Link, useLocation } from 'react-router'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants/path'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { UserAvatar } from '@/components/common/user-avatar'
import { UserNavDropdown } from '@/features/user'

const navItems = [
  { icon: Users, path: '/admin/users', label: 'Người dùng' }
]

export default function AdminLayout() {
  const location = useLocation()
  const { user } = useAuthContext()

  return (
    <div className='flex h-screen w-full overflow-hidden bg-background'>
      <nav className='w-16 bg-sidebar flex flex-col items-center py-4 shrink-0 z-60 relative h-full'>
        {/* Avatar */}
        <UserNavDropdown>
          <div className='mb-4 cursor-pointer flex justify-center w-full'>
            <div className='w-12 h-12 flex items-center justify-center rounded-lg transition-all data-[state=open]:bg-sidebar-accent group'>
              <UserAvatar
                src={user?.avatar}
                name={user?.fullName || 'Admin'}
                className='w-10 h-10 border border-white/20 transition-transform group-hover:scale-105 active:scale-95'
                fallbackClassName='bg-primary text-white text-sm'
              />
            </div>
          </div>
        </UserNavDropdown>

        {/* Nav items */}
        <div className='flex flex-col space-y-2 w-full'>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
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

        {/* Back to home */}

      </nav>

      <main className='flex-1 overflow-y-auto bg-background'>
        <Outlet />
      </main>
    </div>
  )
}
