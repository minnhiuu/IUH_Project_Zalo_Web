import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkAsReadMutation } from '@/features/notification/queries/use-mutations'
import { useMyNotificationsQuery } from '@/features/notification/queries/use-queries'
import { NotificationItem } from './notification-item'
import { useInView } from 'react-intersection-observer'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getMyNotificationsOptions } from '../queries/options'
import { ChevronUp } from 'lucide-react'
import { useNotificationText } from '../locales/use-notification-text'
import {
  type NotificationFlatHistoryResponse,
  type NotificationHistoryResponse,
  type NotificationGroupResponse
} from '@/features/notification/schemas/notification.schema'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type NotificationFilter = 'all' | 'unread'

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
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMyNotificationsQuery(10, filter)
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const { ref, inView } = useInView({ rootMargin: '400px', threshold: 0 })
  const { group, empty, filter: localeFilter, list } = useNotificationText()

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id)
    },
    [markAsRead]
  )

  const grouped = useMemo(() => {
    if (!data) return { newest: [], today: [], previous: [] }

    if (filter === 'unread') {
      const allItems = data.pages.flatMap((page) => (page as NotificationFlatHistoryResponse).items)
      return { newest: allItems, today: [], previous: [] }
    }

    const firstPage = data.pages[0] as NotificationHistoryResponse
    const newest = firstPage?.newest ?? []
    const today = firstPage?.today ?? []
    const previous = data.pages.flatMap((page) => (page as NotificationHistoryResponse).previous)

    return {
      newest,
      today,
      previous
    }
  }, [data, filter])

  const [showScrollBadge, setShowScrollBadge] = useState(false)
  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [prevFirstId, setPrevFirstId] = useState<string | undefined>(undefined)

  const firstNotificationId = grouped.newest[0]?.id ?? grouped.today[0]?.id ?? grouped.previous[0]?.id

  if (firstNotificationId !== prevFirstId) {
    setPrevFirstId(firstNotificationId)
    if (prevFirstId && isScrolledDown) {
      setShowScrollBadge(true)
    }
  }

  useEffect(() => {
    const pagesCount = data?.pages.length ?? 0
    if (pagesCount > 1 && inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, data?.pages.length])

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && (data?.pages.length ?? 0) === 1) {
      const lastPage = data?.pages[0] as NotificationHistoryResponse | NotificationFlatHistoryResponse
      if (lastPage?.nextCursor) {
        const apiFilter = filter === 'unread' ? 'UNREAD' : 'ALL'
        queryClient.prefetchInfiniteQuery(getMyNotificationsOptions(10, i18n.language, apiFilter))
      }
    }
  }, [data?.pages, hasNextPage, isFetchingNextPage, filter, i18n.language, queryClient])

  const handleScrollToTop = () => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' })
      setShowScrollBadge(false)
      setIsScrolledDown(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const currentScrollTop = target.scrollTop

    if (currentScrollTop > 150 && !isScrolledDown) {
      setIsScrolledDown(true)
    } else if (currentScrollTop < 100) {
      if (isScrolledDown) setIsScrolledDown(false)
      if (showScrollBadge) setShowScrollBadge(false)
    }
  }

  const isEmpty = grouped.newest.length === 0 && grouped.today.length === 0 && grouped.previous.length === 0

  if (isLoading) {
    return <NotificationSkeleton />
  }

  if (isEmpty) {
    return (
      <div className='flex h-[400px] flex-col items-center justify-center gap-2 text-center px-6'>
        <div className='mb-2'>
          <svg viewBox='0 0 112 112' width='112' height='112'>
            <rect
              width='18.98'
              height='18.98'
              x='34.96'
              y='82'
              fill='#1876f2'
              rx='9.49'
              transform='rotate(-15 44.445 91.471)'
            />
            <circle cx='43.01' cy='26.27' r='6.85' fill='#7a7d81' />
            <path fill='#bcc0c4' d='M75.28 43.44a26.72 26.72 0 1 0-51.62 13.83L30 81l51.62-13.87z' />
            <path fill='#bcc0c4' d='M90.78 75.64 26.33 92.9l3.22-13.63 51.62-13.83 9.61 10.2z' />
            <rect
              width='66.91'
              height='8.88'
              x='25.35'
              y='80.75'
              fill='#bcc0c4'
              rx='4.44'
              transform='rotate(-15 58.793 85.207)'
            />
          </svg>
        </div>
        <div>
          <p className='font-bold text-[21px] text-[#65676b] dark:text-[#bcc0c4] leading-tight'>{empty.title}</p>
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
          <span className='text-[14px] font-bold'>{list.newUpdates}</span>
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className='h-full' onScrollCapture={handleScroll}>
        <div className='flex flex-col pb-4'>
          {grouped.newest.length > 0 && (
            <div className='flex flex-col'>
              <div className='flex items-center justify-between px-4 py-2 mt-2'>
                <h4 className='text-[17px] font-bold text-foreground'>
                  {filter === 'unread' ? localeFilter.unread : group.newest}
                </h4>
              </div>
              {grouped.newest.map((notification: NotificationGroupResponse) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          )}

          {grouped.today.length > 0 && (
            <div className='flex flex-col'>
              <div className='flex items-center justify-between px-4 py-2 mt-4'>
                <h4 className='text-[17px] font-bold text-foreground'>{group.today}</h4>
              </div>
              {grouped.today.map((notification: NotificationGroupResponse) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          )}

          {grouped.previous.length > 0 && (
            <div className='flex flex-col'>
              <div className='flex items-center justify-between px-4 py-2 mt-4'>
                <h4 className='text-[17px] font-bold text-foreground'>{group.previous}</h4>
              </div>
              {grouped.previous.map((notification: NotificationGroupResponse) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
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
                  {isFetchingNextPage ? list.loading : list.loadPrevious}
                </Button>
              ) : (
                isFetchingNextPage && (
                  <div className='flex flex-col gap-1'>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className='flex gap-3 px-4 py-2 items-center animate-pulse'>
                        <Skeleton className='h-12 w-12 rounded-full shrink-0 bg-muted/60' />
                        <div className='flex-1 space-y-2'>
                          <Skeleton className='h-3 w-[70%] bg-muted/60' />
                          <Skeleton className='h-2 w-[40%] bg-muted/60' />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          <div ref={ref} className='h-1' />
        </div>
      </ScrollArea>
    </div>
  )
}
