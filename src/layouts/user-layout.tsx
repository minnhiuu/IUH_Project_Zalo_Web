import { Outlet, Link, useLocation } from 'react-router'
import { MessageSquare, Contact2, CheckSquare, Settings, Cloud, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants/path'
import { UserNavDropdown } from '@/features/user'

export default function UserLayout() {
  const location = useLocation()

  const navItems = [
    { icon: MessageSquare, path: PATHS.HOME, label: 'Tin nhắn' },
    { icon: Contact2, path: '/contacts', label: 'Danh bạ' },
    { icon: CheckSquare, path: '/todo', label: 'To-do' }
  ]

  const bottomItems = [
    { icon: Cloud, path: '/cloud', label: 'Cloud' },
    { icon: Briefcase, path: '/business', label: 'Business' },
    { icon: Settings, path: PATHS.USER.SETTINGS, label: 'Cài đặt' }
  ]

  return (
    <div className='flex h-screen w-full overflow-hidden bg-background'>
      {/* Navigation Sidebar */}
      <nav className='w-[64px] bg-sidebar flex flex-col items-center py-4 shrink-0'>
        {/* User Avatar with Dropdown */}
        <UserNavDropdown>
          <div className='mb-4 cursor-pointer flex justify-center w-full'>
            <div className='w-12 h-12 flex items-center justify-center rounded-lg transition-all data-[state=open]:bg-sidebar-accent group'>
              <div className='w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-zinc-200 transition-transform group-hover:scale-105 active:scale-95'>
                <img
                  src='https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
                  alt='Avatar'
                  className='w-full h-full object-cover'
                />
              </div>
            </div>
          </div>
        </UserNavDropdown>

        {/* Top Nav Items */}
        <div className='flex flex-col space-y-2 w-full'>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
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
            if (item.label === 'Cài đặt') {
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
    </div>
  )
}
