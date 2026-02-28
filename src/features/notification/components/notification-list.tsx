import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkAsReadMutation } from '@/features/notification/queries/use-mutations'
import { useMyNotificationsQuery } from '@/features/notification/queries/use-queries'
import { NotificationItem } from './notification-item'
import { useInView } from 'react-intersection-observer'
import { useEffect, useMemo } from 'react'
import { BellOff } from 'lucide-react'
import type { NotificationFilter } from './notification-panel'
import { useNotificationText } from '../locales/use-notification-text'

const NotificationSkeleton = () => (
  <div className='flex flex-col gap-1'>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className='flex gap-3 p-4 items-center'>
        <Skeleton className='h-12 w-12 rounded-full shrink-0' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-3 w-[70%] rounded-md' />
        </div>
      </div>
    ))}
  </div>
)

interface NotificationListProps {
  filter: NotificationFilter
}

export const NotificationList = ({ filter }: NotificationListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMyNotificationsQuery(10)
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const { ref, inView } = useInView()
  const { group, empty } = useNotificationText()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const grouped = useMemo(() => {
    if (!data) return { newest: [], today: [], previous: [] }

    // First page contains 'newest' and 'today' buckets
    const firstPage = data.pages[0]
    const newest = firstPage?.newest ?? []
    const today = firstPage?.today ?? []

    // Flatten all 'previous' items from all pages
    const previous = data.pages.flatMap((page) => page.previous)

    const applyFilter = (list: typeof newest) => {
      if (filter === 'unread') return list.filter((n) => !n.read)
      return list
    }

    return {
      newest: applyFilter(newest),
      today: applyFilter(today),
      previous: applyFilter(previous)
    }
  }, [data, filter])

  const isEmpty = grouped.newest.length === 0 && grouped.today.length === 0 && grouped.previous.length === 0

  if (isLoading) {
    return <NotificationSkeleton />
  }

  if (isEmpty) {
    return (
      <div className='flex h-[400px] flex-col items-center justify-center gap-4 text-center px-6'>
        <div className='rounded-full bg-muted p-4'>
          <BellOff className='h-10 w-10 text-muted-foreground' />
        </div>
        <div className='space-y-1'>
          <p className='font-bold text-lg text-foreground'>{empty.title}</p>
          <p className='text-[15px] text-muted-foreground'>{empty.placeholder}</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className='h-full'>
      <div className='flex flex-col pb-4'>
        {grouped.newest.length > 0 && (
          <div className='flex flex-col'>
            <div className='flex items-center justify-between px-4 py-2 mt-2'>
              <h4 className='text-[17px] font-bold text-foreground'>{group.newest}</h4>
            </div>
            {grouped.newest.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead(id)}
              />
            ))}
          </div>
        )}

        {grouped.today.length > 0 && (
          <div className='flex flex-col'>
            <div className='flex items-center justify-between px-4 py-2 mt-4'>
              <h4 className='text-[17px] font-bold text-foreground'>{group.today}</h4>
            </div>
            {grouped.today.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead(id)}
              />
            ))}
          </div>
        )}

        {grouped.previous.length > 0 && (
          <div className='flex flex-col'>
            <div className='flex items-center justify-between px-4 py-2 mt-4'>
              <h4 className='text-[17px] font-bold text-foreground'>{group.previous}</h4>
            </div>
            {grouped.previous.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead(id)}
              />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div ref={ref} className='flex flex-col'>
            {isFetchingNextPage && (
              <div className='flex flex-col gap-1'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex gap-3 p-4 items-center'>
                    <Skeleton className='h-12 w-12 rounded-full shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-3 w-[70%]' />
                      <Skeleton className='h-2 w-[40%]' />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
