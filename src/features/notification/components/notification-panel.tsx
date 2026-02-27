import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationList } from './notification-list'
import { useNotificationText } from '../locales/use-notification-text'
import { useState } from 'react'

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export type NotificationFilter = 'all' | 'unread'

export function NotificationPanel({ open }: NotificationPanelProps) {
  const { title } = useNotificationText()
  const [filter, setFilter] = useState<NotificationFilter>('all')

  return (
    <div
      className={cn(
        'fixed inset-y-0 z-50 w-[360px] bg-background border-r border-border flex flex-col transition-transform duration-300 ease-in-out shadow-xl',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
      style={{ left: '64px' }}
    >
      <div className='flex flex-col px-4 pt-4 pb-2 shrink-0 bg-background'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-2xl font-bold text-foreground tracking-tight'>{title}</h3>
          <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full hover:bg-muted'>
            <MoreHorizontal className='h-5 w-5 text-foreground' />
          </Button>
        </div>

        <div className='flex gap-2 mb-2'>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[15px] font-semibold transition-colors',
              filter === 'all'
                ? 'bg-brand-blue-light text-brand-blue-text dark:bg-brand-blue/20 dark:text-brand-blue-light'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[15px] font-semibold transition-colors',
              filter === 'unread'
                ? 'bg-brand-blue-light text-brand-blue-text dark:bg-brand-blue/20 dark:text-brand-blue-light'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Chưa đọc
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <NotificationList filter={filter} />
      </div>
    </div>
  )
}
