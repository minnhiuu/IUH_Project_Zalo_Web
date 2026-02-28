import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkAsReadMutation } from '@/features/notification/queries/use-mutations'
import { useMyNotificationsQuery } from '@/features/notification/queries/use-queries'
import { NotificationItem } from './notification-item'
import { useInView } from 'react-intersection-observer'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BellOff, ChevronUp } from 'lucide-react'
import type { NotificationFilter } from './notification-panel'
import { useNotificationText } from '../locales/use-notification-text'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  const grouped = useMemo(() => {
    if (!data) return { newest: [], today: [], previous: [] }

    const firstPage = data.pages[0]
    const newest = firstPage?.newest ?? []
    const today = firstPage?.today ?? []

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

  const [showScrollBadge, setShowScrollBadge] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [prevFirstId, setPrevFirstId] = useState<string | undefined>(undefined)

  const firstNotificationId = grouped.newest[0]?.id ?? grouped.today[0]?.id ?? grouped.previous[0]?.id

  if (firstNotificationId !== prevFirstId) {
    setPrevFirstId(firstNotificationId)
    if (prevFirstId && scrollTop > 150) {
      setShowScrollBadge(true)
    }
  }

  useEffect(() => {
    const isFirstPage = (data?.pages.length ?? 0) <= 1
    if (!isFirstPage && inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, data?.pages.length])

  const handleScrollToTop = () => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' })
      setShowScrollBadge(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const currentScrollTop = target.scrollTop
    setScrollTop(currentScrollTop)

    if (currentScrollTop < 100) {
      setShowScrollBadge(false)
    }
  }

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
    <div className='relative h-full overflow-hidden'>
      <div
        className={cn(
          'absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform',
          showScrollBadge
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-12 opacity-0 scale-95 pointer-events-none'
        )}
      >
        <Button
          onClick={handleScrollToTop}
          size='sm'
          className='rounded-full shadow-xl bg-brand-blue hover:bg-brand-blue/90 text-white px-5 h-10 flex items-center gap-2 border-none ring-4 ring-background animate-in fade-in slide-in-from-top-4 duration-300'
        >
          <ChevronUp className='w-4 h-4' />
          <span className='text-[14px] font-bold'>Có thông báo mới</span>
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className='h-full' onScrollCapture={handleScroll}>
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
            <div className='px-4 py-4'>
              {(data?.pages.length ?? 0) <= 1 ? (
                <Button
                  variant='secondary'
                  className='w-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-bold h-10 rounded-lg'
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Đang tải...' : 'Xem thông báo trước đó'}
                </Button>
              ) : (
                <div className='flex flex-col gap-1'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='flex gap-3 px-4 py-2 items-center'>
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

          <div ref={ref} className='h-1' />
        </div>
      </ScrollArea>
    </div>
  )
}
