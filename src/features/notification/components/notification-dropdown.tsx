import { Bell } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { NotificationList, type NotificationFilter } from './notification-list'
import { useNotificationText } from '../locales/use-notification-text'
import { NotificationMenu } from './notification-menu'
import { useNotificationStateQuery } from '../queries/use-queries'

export function NotificationDropdown() {
  const { title, filter: filterText } = useNotificationText()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [isOpen, setIsOpen] = useState(false)

  const { data: state } = useNotificationStateQuery()
  const unreadCount = state?.unreadCount ?? 0

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className='p-2.5 hover:bg-muted rounded-full text-muted-foreground relative transition-all group'>
          <Bell className='w-5.5 h-5.5 group-hover:text-primary transition-colors' />
          {unreadCount > 0 && (
            <span className='absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-destructive text-white text-[10px] font-bold rounded-full border-2 border-layout-header-bg flex items-center justify-center animate-in zoom-in duration-300'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={12}
        className='w-[400px] p-0 shadow-2xl border-layout-header-border bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-200 rounded-2xl ring-1 ring-black/5'
      >
        <div className='flex flex-col h-[600px]'>
          <div className='flex flex-col px-5 pt-5 pb-3 shrink-0 border-b border-border/50'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-foreground tracking-tight'>{title}</h3>
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
            <NotificationList key={filter} filter={filter} />
          </div>

          <div className='p-3 text-center border-t border-border/50 shrink-0 bg-muted/20'>
            <button className='text-sm font-semibold text-primary hover:underline transition-all'>
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
