import { Outlet, Link, useLocation } from 'react-router'
import { Users, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants/path'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { UserAvatar } from '@/components/common/user-avatar'
import { UserNavDropdown } from '@/features/user'
import { LogoutConfirmDialog } from '@/features/auth'
import { useState } from 'react'

const navItems = [
  { icon: Users, path: '/admin/users', label: 'Người dùng' }
]

export default function AdminLayout() {
  const location = useLocation()
  const { user } = useAuthContext()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  return (
    <div className='flex h-screen w-full overflow-hidden bg-background'>
      <nav className='w-52 bg-sidebar flex flex-col py-4 shrink-0 z-60 relative h-full'>
        {/* Avatar */}
        <UserNavDropdown>
          <div className='mb-6 cursor-pointer px-3'>
            <div className='flex items-center gap-3 px-2 py-2 rounded-lg transition-all data-[state=open]:bg-sidebar-accent hover:bg-white/10 group'>
              <UserAvatar
                src={user?.avatar}
                name={user?.fullName || 'Admin'}
                className='w-9 h-9 border border-white/20 shrink-0'
                fallbackClassName='bg-primary text-white text-sm'
              />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-white truncate'>{user?.fullName ?? 'Admin'}</p>
                <p className='text-xs text-white/60 truncate'>Quản trị viên</p>
              </div>
            </div>
          </div>
        </UserNavDropdown>

        {/* Nav items */}
        <div className='flex flex-col space-y-1 px-3 flex-1'>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                  isActive ? 'bg-sidebar-accent text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className='w-5 h-5 shrink-0' />
                <span className='text-sm font-medium'>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Logout */}
        <div className='px-3 mt-2'>
          <button
            onClick={() => setShowLogoutDialog(true)}
            className='flex items-center gap-3 px-3 py-2 rounded-lg w-full text-white/80 hover:bg-white/10 hover:text-white transition-all'
          >
            <LogOut className='w-5 h-5 shrink-0' />
            <span className='text-sm font-medium'>Đăng xuất</span>
          </button>
        </div>
      </nav>

      <main className='flex-1 overflow-y-auto bg-background'>
        <Outlet />
      </main>

      <LogoutConfirmDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </div>
  )
}
