import { Bell } from 'lucide-react'
import { useState, useRef } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { NotificationList, type NotificationFilter } from './notification-list'
import { useNotificationText } from '../locales/use-notification-text'
import { NotificationMenu } from './notification-menu'
import { useNotificationStateQuery } from '../queries/use-queries'

interface NotificationDropdownProps {
  onOpenChange?: (open: boolean) => void
  triggerClassName?: string
  iconClassName?: string
  badgeClassName?: string
}

export function NotificationDropdown({
  onOpenChange,
  triggerClassName,
  iconClassName,
  badgeClassName
}: NotificationDropdownProps) {
  const { title, filter: filterText, dropdown } = useNotificationText()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { data: state } = useNotificationStateQuery()
  const unreadCount = state?.unreadCount ?? 0

  const handleOpenChange = (open: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
    onOpenChange?.(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      onOpenChange?.(false)
    }, 250)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          title={dropdown.trigger}
          aria-label={dropdown.trigger}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'p-2.5 hover:bg-muted rounded-full text-muted-foreground relative transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35 active:scale-95',
            isOpen && 'bg-muted text-foreground shadow-sm',
            triggerClassName
          )}
        >
          <Bell className={cn('w-5.5 h-5.5 group-hover:text-primary transition-colors', iconClassName)} />
          {unreadCount > 0 && (
            <span
              aria-label={dropdown.unreadBadge(unreadCount)}
              className={cn(
                'absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-destructive text-white text-[10px] font-bold rounded-full border-2 border-layout-header-bg flex items-center justify-center animate-in zoom-in duration-300',
                badgeClassName
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={12}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='w-[min(92vw,420px)] max-w-[420px] p-0 shadow-2xl border-layout-header-border bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-200 rounded-2xl ring-1 ring-black/5'
      >
        <div className='flex flex-col h-[min(70vh,620px)]'>
          <div className='flex flex-col px-5 pt-5 pb-3 shrink-0 border-b border-border/50'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <h3 className='text-xl font-bold text-foreground tracking-tight'>{title}</h3>
                {unreadCount > 0 && (
                  <span className='rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] font-semibold text-brand-blue'>
                    {dropdown.unreadBadge(unreadCount)}
                  </span>
                )}
              </div>
              <NotificationMenu />
            </div>

            <div className='flex gap-2'>
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all duration-200',
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {filterText.all}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all duration-200',
                  filter === 'unread'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {filterText.unread}
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-hidden'>
            <NotificationList filter={filter} />
          </div>

          <div className='p-3 border-t border-border/50 shrink-0 bg-muted/20'>
            <button className='w-full rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-brand-blue/10 transition-all'>
              {dropdown.viewAll}
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
