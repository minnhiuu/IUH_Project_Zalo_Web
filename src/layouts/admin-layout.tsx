import { Outlet, Link, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Bell,
  Menu,
  User,
  Key,
  Search,
  Globe,
  Check,
  Sun,
  Moon,
  Laptop
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants/path'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { useLocale } from '@/lib/i18n'
import { useAdminText } from '@/locales/admin/use-admin-text'

export default function AdminLayout() {
  const location = useLocation()
  const { user, logoutLocal } = useAuthContext()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()
  const { locale: language, changeLocale: setLocale, languages } = useLocale()
  const { text } = useAdminText()

  const adminNavItems = [
    { icon: LayoutDashboard, path: PATHS.ADMIN.DASHBOARD, label: text.menu.dashboard },
    { icon: Users, path: PATHS.ADMIN.USERS, label: text.menu.users },
    { icon: Search, path: PATHS.ADMIN.ELASTICSEARCH, label: text.menu.elasticsearch }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className='flex h-screen w-full overflow-hidden bg-layout-background text-foreground admin-theme font-sans'>
      <aside
        className={cn(
          'bg-layout-sidebar-bg text-layout-sidebar-text transition-all duration-300 ease-in-out flex flex-col z-50 border-r border-layout-sidebar-border',
          isSidebarCollapsed ? 'w-0 lg:w-[80px] -translate-x-full lg:translate-x-0' : 'w-[260px]'
        )}
      >
        <div className='h-20 flex items-center px-6 shrink-0 gap-3'>
          <div className='flex items-center justify-center shrink-0 w-10 h-10'>
            <img src='/images/logo.png' alt='BondHub' className='w-full h-full object-contain' />
          </div>
          {!isSidebarCollapsed && (
            <div className='flex flex-col animate-in fade-in duration-300'>
              <span className='font-black text-layout-sidebar-text-active text-xl tracking-tight leading-none uppercase'>
                {text.brand}
              </span>
              <span className='text-[10px] text-layout-sidebar-text font-bold mt-1 uppercase tracking-[0.2em]'>
                {text.panel}
              </span>
            </div>
          )}
        </div>

        <div className='flex-1 py-4 px-4 space-y-1.5 overflow-y-auto no-scrollbar'>
          {adminNavItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative',
                  active
                    ? 'bg-layout-sidebar-bg-active text-layout-sidebar-text-active shadow-sm'
                    : 'hover:bg-layout-sidebar-bg-hover hover:text-layout-sidebar-text-active'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors duration-200',
                    active ? 'text-primary' : 'text-layout-sidebar-text group-hover:text-layout-sidebar-text-active'
                  )}
                />

                {!isSidebarCollapsed && (
                  <span
                    className={cn('ml-3 text-[15px] transition-all duration-200 font-medium', active && 'font-bold')}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </aside>

      <div className='flex-1 flex flex-col overflow-hidden bg-layout-background'>
        <header className='h-20 bg-layout-header-bg border-b border-layout-header-border flex items-center justify-between px-6 lg:px-10 shrink-0 z-40 transition-all'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className='p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors'
            >
              <Menu className='w-6 h-6' />
            </button>
          </div>

          <div className='flex items-center gap-5'>
            <div className='flex items-center gap-2'>
              <button className='p-2.5 hover:bg-muted rounded-full text-muted-foreground relative transition-all group'>
                <Bell className='w-5.5 h-5.5 group-hover:text-primary transition-colors' />
                <span className='absolute top-2.5 right-2.5 w-2 h-2 bg-destructive-solid rounded-full border-2 border-layout-header-bg shadow-sm' />
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className='p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-all group'
              >
                {theme === 'dark' ? (
                  <Sun className='w-5.5 h-5.5 group-hover:text-amber-500 transition-colors' />
                ) : (
                  <Moon className='w-5.5 h-5.5 group-hover:text-indigo-600 transition-colors' />
                )}
              </button>
            </div>

            <div className='h-8 w-px bg-layout-header-border mx-1 opacity-50' />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex items-center gap-3.5 px-3 py-1.5 hover:bg-muted rounded-xl transition-all outline-none group border border-transparent hover:border-border'>
                  <div className='text-right hidden sm:block'>
                    <p className='text-sm font-bold text-foreground leading-none'>{user?.fullName}</p>
                    <p className='text-[11px] text-muted-foreground font-semibold uppercase mt-1.5 tracking-wider'>
                      {text.systemAdmin}
                    </p>
                  </div>
                  <UserAvatar
                    src={user?.avatar}
                    name={user?.fullName || 'Admin'}
                    className='w-10 h-10 border-2 border-primary/10 shadow-md ring-1 ring-primary/5'
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56 p-1 rounded-md shadow-md border-layout-header-border bg-card animate-in fade-in zoom-in-95 duration-100'
              >
                <DropdownMenuLabel className='px-2 py-1.5 text-xs font-normal text-muted-foreground'>
                  {text.menu.myAccount}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer'>
                  <User className='w-4 h-4' /> {text.menu.profile}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer'>
                  <Key className='w-4 h-4' /> {text.menu.changePassword}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className='flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer outline-none'>
                    <Globe className='w-4 h-4' />
                    <span className='flex-1'>{text.menu.language}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    sideOffset={5}
                    className='w-44 p-1 shadow-lg border border-border animate-in slide-in-from-left-1 duration-200 bg-popover text-popover-foreground'
                  >
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                        className='flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md group text-[13.5px] outline-none'
                      >
                        <div className='flex items-center gap-3'>
                          <img src={lang.flag} alt={lang.label} className='w-4.5 h-auto object-cover' />
                          <span className='font-medium'>{lang.label}</span>
                        </div>
                        {language === lang.code && <Check className='w-3.5 h-3.5 text-primary' />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className='flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer outline-none'>
                    {theme === 'dark' ? <Moon className='w-4 h-4' /> : <Sun className='w-4 h-4' />}
                    <span className='flex-1'>{text.menu.appearance}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    sideOffset={5}
                    className='w-44 p-1 shadow-lg border border-border animate-in slide-in-from-left-1 duration-200 bg-popover text-popover-foreground'
                  >
                    <DropdownMenuItem
                      onClick={() => setTheme('light')}
                      className='flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md group text-[13.5px] outline-none'
                    >
                      <div className='flex items-center gap-3'>
                        <Sun className='w-4 h-4' />
                        <span className='font-medium'>{text.menu.themeLight}</span>
                      </div>
                      {theme === 'light' && <Check className='w-3.5 h-3.5 text-primary' />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('dark')}
                      className='flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md group text-[13.5px] outline-none'
                    >
                      <div className='flex items-center gap-3'>
                        <Moon className='w-4 h-4' />
                        <span className='font-medium'>{text.menu.themeDark}</span>
                      </div>
                      {theme === 'dark' && <Check className='w-3.5 h-3.5 text-primary' />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('system')}
                      className='flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md group text-[13.5px] outline-none'
                    >
                      <div className='flex items-center gap-3'>
                        <Laptop className='w-4 h-4' />
                        <span className='font-medium'>{text.menu.themeSystem}</span>
                      </div>
                      {theme === 'system' && <Check className='w-3.5 h-3.5 text-primary' />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logoutLocal}
                  className='flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive'
                >
                  <LogOut className='w-4 h-4' /> {text.menu.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className='flex-1 overflow-y-auto p-8 custom-scrollbar'>
          <div className='max-w-[1600px] mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
