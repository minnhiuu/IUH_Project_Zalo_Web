import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkAsReadMutation } from '@/features/notification/queries/use-mutations'
import { useMyNotificationsQuery } from '@/features/notification/queries/use-queries'
import type { NotificationGroupResponse } from '../schemas/notification.schema'
import { NotificationItem } from './notification-item'
import { useInView } from 'react-intersection-observer'
import { useEffect, useMemo } from 'react'
import { BellOff } from 'lucide-react'
import { useNotificationText } from '../locales/use-notification-text'
import { isToday } from 'date-fns'
import type { NotificationFilter } from './notification-panel'
import { Button } from '@/components/ui/button'

interface NotificationListProps {
  filter: NotificationFilter
}

export const NotificationList = ({ filter }: NotificationListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMyNotificationsQuery()
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const { ref, inView } = useInView()
  const { empty } = useNotificationText()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const notifications = useMemo<NotificationGroupResponse[]>(() => {
    const raw = (data?.pages.flatMap((page) => page.data) as NotificationGroupResponse[]) ?? []
    if (filter === 'unread') {
      return raw.filter((n) => !n.isRead)
    }
    return raw
  }, [data, filter])

  const groupedNotifications = useMemo(() => {
    return {
      today: notifications.filter((n) => isToday(new Date(n.lastModifiedAt))),
      earlier: notifications.filter((n) => !isToday(new Date(n.lastModifiedAt)))
    }
  }, [notifications])

  if (isLoading) {
    return (
      <div className='flex flex-col'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex gap-4 p-4'>
            <Skeleton className='h-14 w-14 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-[80%]' />
              <Skeleton className='h-3 w-[40%]' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className='flex h-[400px] flex-col items-center justify-center gap-4 text-center px-6'>
        <div className='rounded-full bg-muted p-4'>
          <BellOff className='h-10 w-10 text-muted-foreground' />
        </div>
        <div className='space-y-1'>
          <p className='font-bold text-lg text-foreground'>{empty.title}</p>
          <p className='text-[15px] text-muted-foreground'>{empty.description}</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className='h-full'>
      <div className='flex flex-col pb-4'>
        {groupedNotifications.today.length > 0 && (
          <div className='flex flex-col'>
            <div className='flex items-center justify-between px-4 py-2 mt-2'>
              <h4 className='text-[17px] font-bold text-foreground'>Hôm nay</h4>
              <Button variant='link' className='text-brand-blue h-auto p-0 text-[15px] font-normal'>
                Xem tất cả
              </Button>
            </div>
            {groupedNotifications.today.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead(id)}
              />
            ))}
          </div>
        )}

        {groupedNotifications.earlier.length > 0 && (
          <div className='flex flex-col'>
            <div className='flex items-center justify-between px-4 py-2 mt-4'>
              <h4 className='text-[17px] font-bold text-foreground'>Trước đó</h4>
              <Button variant='link' className='text-brand-blue h-auto p-0 text-[15px] font-normal'>
                Xem tất cả
              </Button>
            </div>
            {groupedNotifications.earlier.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead(id)}
              />
            ))}
          </div>
        )}

        <div className='px-4 mt-6'>
          <Button variant='secondary' className='w-full bg-muted/60 hover:bg-muted font-bold text-[15px] h-10'>
            Xem thông báo trước đó
          </Button>
        </div>

        {hasNextPage && (
          <div ref={ref} className='p-4 text-center'>
            {isFetchingNextPage && <Skeleton className='h-14 w-full rounded-xl' />}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
