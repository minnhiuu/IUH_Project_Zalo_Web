import { useState } from 'react'
import { Search, MessageSquare, Settings, LayoutList, PlaySquare, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { PATHS } from '@/constants/path'
import { SettingsDialog } from '@/features/user'
import { LogoutConfirmDialog } from '@/features/auth'
import { NotificationDropdown } from '@/features/notification'
import { useMarkHistoryAsCheckedMutation } from '@/features/notification/queries/use-mutations'
import { notificationKeys } from '@/features/notification/queries/keys'

interface SocialFeedHeaderProps {
  query: string
  onQueryChange: (value: string) => void
  placeholder: string
}

export function SocialFeedHeader({ query, onQueryChange, placeholder }: SocialFeedHeaderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isReels = searchParams.get('tab') === 'reels' || location.pathname === PATHS.REELS
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { mutate: markAsChecked } = useMarkHistoryAsCheckedMutation()

  const handleNotificationOpenChange = (open: boolean) => {
    if (!open) return
    markAsChecked()
    queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  }

  return (
    <header className='sticky top-0 z-30 h-[68px] border-b border-border bg-background shadow-sm shrink-0'>
      <div className='h-full mx-auto flex w-full items-center justify-between px-4'>
        {/* Left: Logo & Search */}
        <div className='flex items-center gap-4 w-[344px] shrink-0'>
          <div
            className='flex items-center gap-2.5 shrink-0 cursor-pointer ml-2'
            onClick={() => navigate(PATHS.SOCIAL_FEED)}
          >
            <div className='text-xl font-bold tracking-tight text-[#0068ff] dark:text-blue-400'>Bondhub</div>
          </div>

          <div className='relative flex-1 hidden md:block'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={placeholder}
              className='h-9 w-full rounded-full border-muted bg-muted/30 pl-9 pr-4 text-[13px] font-medium transition-all focus-visible:bg-background'
            />
          </div>
        </div>

        {/* Center: Tabs */}
        <div className='flex flex-1 items-center justify-center gap-2'>
          <Button
            variant='ghost'
            onClick={() => navigate(`${PATHS.SOCIAL_FEED}?tab=feed`)}
            className={`h-10 px-6 rounded-lg transition-all flex items-center gap-2 text-[14.5px] ${
              !isReels
                ? 'bg-[#e5f1ff] text-[#0068ff] dark:bg-blue-900/20 dark:text-blue-400 font-semibold'
                : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <LayoutList className='h-4 w-4' />
            Feed
          </Button>

          <Button
            variant='ghost'
            onClick={() => navigate(`${PATHS.SOCIAL_FEED}?tab=reels`)}
            className={`h-10 px-6 rounded-lg transition-all flex items-center gap-2 text-[14.5px] ${
              isReels
                ? 'bg-[#e5f1ff] text-[#0068ff] dark:bg-blue-900/20 dark:text-blue-400 font-semibold'
                : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <PlaySquare className='h-4 w-4' />
            Reels
          </Button>
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-1.5 w-[344px] shrink-0 justify-end pr-2'>
          <Button
            variant='ghost'
            size='icon'
            className='h-10 w-10 rounded-full text-muted-foreground hover:text-foreground'
            onClick={() => navigate(PATHS.HOME)}
            title='Messages'
          >
            <MessageSquare className='h-5 w-5' />
          </Button>

          <NotificationDropdown
            onOpenChange={handleNotificationOpenChange}
            triggerClassName='relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground p-0'
            iconClassName='h-5 w-5'
            badgeClassName='top-1 right-1 border-2 border-background'
          />

          <Button
            variant='ghost'
            size='icon'
            className='h-10 w-10 rounded-full text-muted-foreground hover:text-foreground'
            onClick={() => setShowSettingsDialog(true)}
            title='Settings'
          >
            <Settings className='h-5 w-5' />
          </Button>

          <div className='w-px h-5 bg-border mx-1' />

          <Button
            variant='ghost'
            size='icon'
            className='h-10 w-10 rounded-full text-rose-500/80 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 transition-colors'
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
