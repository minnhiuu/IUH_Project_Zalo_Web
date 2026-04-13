import { useState } from 'react'
import { Search, MessageSquare, Bell, Settings, LayoutList, PlaySquare, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router'
import { PATHS } from '@/constants/path'
import { SettingsDialog } from '@/features/user'
import { LogoutConfirmDialog } from '@/features/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface SocialFeedHeaderProps {
  query: string
  onQueryChange: (value: string) => void
  placeholder: string
}

export function SocialFeedHeader({ query, onQueryChange, placeholder }: SocialFeedHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isReels = searchParams.get('tab') === 'reels' || location.pathname === PATHS.REELS
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  return (
    <header className='sticky top-0 z-30 border-b border-zinc-200/50 bg-white/70 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-white/5 dark:bg-zinc-950/70'>
      <div className='mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8'>
        {/* Left: Logo & Search */}
        <div className='flex flex-1 items-center gap-4 md:flex-none md:w-[360px]'>
          <div className='flex items-center gap-2.5 shrink-0 cursor-pointer' onClick={() => navigate(PATHS.SOCIAL_FEED)}>
            <div className='text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400'>
              Bondhub
            </div>
          </div>

          <div className='relative flex-1 max-w-[240px] transition-all duration-300 focus-within:max-w-[280px] hidden md:block'>
            <Search className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500' />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={placeholder}
              className='h-10 w-full rounded-full border-zinc-200 bg-zinc-100/80 pl-10 pr-4 text-[13.5px] font-medium text-zinc-900 shadow-none transition-all focus-visible:border-indigo-500/50 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:border-white/5 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus-visible:bg-zinc-900'
            />
          </div>
        </div>

        {/* Center: Tabs */}
        <div className='flex absolute left-1/2 -translate-x-1/2 items-center gap-1 sm:gap-2'>
          <Button
            variant='ghost'
            onClick={() => navigate(`${PATHS.SOCIAL_FEED}?tab=feed`)}
            className={`relative h-11 px-4 sm:px-6 rounded-xl transition-all flex items-center gap-2 ${
              !isReels 
                ? 'bg-transparent text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 font-medium'
            }`}
          >
            <LayoutList className='h-4.5 w-4.5' />
            Feed
            {!isReels && (
              <div className='absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-t-full bg-indigo-600 dark:bg-indigo-400' />
            )}
          </Button>

          <Button
            variant='ghost'
            onClick={() => navigate(`${PATHS.SOCIAL_FEED}?tab=reels`)}
            className={`relative h-11 px-4 sm:px-6 rounded-xl transition-all flex items-center gap-2 ${
              isReels 
                ? 'bg-transparent text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 font-medium'
            }`}
          >
            <PlaySquare className='h-4.5 w-4.5' />
            Reels
            {isReels && (
              <div className='absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-t-full bg-indigo-600 dark:bg-indigo-400' />
            )}
          </Button>
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-1 sm:gap-2 md:w-[360px] shrink-0 justify-end flex-1 md:flex-none'>
          <Button
            variant='ghost'
            size='icon'
            className='relative h-11 w-11 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors'
            onClick={() => navigate(PATHS.HOME)}
            title='Messages'
          >
            <MessageSquare className='h-5 w-5' />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='relative h-11 w-11 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors'
                title='Notifications'
              >
                <Bell className='h-5 w-5' />
                <span className='absolute right-2 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-950 px-0' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-80 p-2'>
              <DropdownMenuLabel className='text-[15px] font-semibold tracking-tight'>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className='my-2' />
              <div className='flex h-40 flex-col items-center justify-center space-y-3 text-center text-[13px] font-medium text-zinc-500 dark:text-zinc-400'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/50'>
                  <Bell className='h-6 w-6 text-zinc-400 dark:text-zinc-500' />
                </div>
                <p>You have no new notifications.</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant='ghost'
            size='icon'
            className='h-11 w-11 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors'
            onClick={() => setShowSettingsDialog(true)}
            title='Settings'
          >
            <Settings className='h-5 w-5' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            className='h-11 w-11 rounded-full text-rose-500/80 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400/70 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors'
            onClick={() => setShowLogoutDialog(true)}
            title='Logout'
          >
            <LogOut className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
      <LogoutConfirmDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </header>
  )
}
