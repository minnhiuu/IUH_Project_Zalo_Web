import { useState, useMemo } from 'react'
import { subMinutes, subHours, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'
import { RefreshCw, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { PATHS } from '@/constants/path'
import { useDeadEventsPaged } from '../queries/use-queries'
import { useRetryDeadEvents } from '../queries/use-mutations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DeadEventDetailModal } from './dead-events-modal'
import { cn } from '@/lib/utils'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'
import { PaginationCustom } from '@/components/ui/pagination-custom'
import { formatFullDateTime } from '@/utils/date'

export const DeadEventsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { text } = useElasticsearchText()
  const retryMutation = useRetryDeadEvents()

  const search = searchParams.get('search') || ''
  const eventType = searchParams.get('eventType') || 'all'
  const timeRange = searchParams.get('timeRange') || 'all'
  const fromDate = searchParams.get('fromDate') || ''
  const toDate = searchParams.get('toDate') || ''
  const currentPage = parseInt(searchParams.get('page') || '1')

  const [searchInput, setSearchInput] = useState(search)
  const [eventTypeInput, setEventTypeInput] = useState(eventType)
  const [timeRangeInput, setTimeRangeInput] = useState(timeRange)
  const [fromDateInput, setFromDateInput] = useState(fromDate)
  const [toDateInput, setToDateInput] = useState(toDate)

  const [prevParams, setPrevParams] = useState({ search, eventType, timeRange, fromDate, toDate })

  if (
    prevParams.search !== search ||
    prevParams.eventType !== eventType ||
    prevParams.timeRange !== timeRange ||
    prevParams.fromDate !== fromDate ||
    prevParams.toDate !== toDate
  ) {
    setPrevParams({ search, eventType, timeRange, fromDate, toDate })
    setSearchInput(search)
    setEventTypeInput(eventType)
    setTimeRangeInput(timeRange)
    setFromDateInput(fromDate)
    setToDateInput(toDate)
  }

  const itemsPerPage = 10

  const serverTimeRange = useMemo(() => {
    const now = new Date()
    if (timeRange === 'all') return { from: undefined, to: undefined }
    if (timeRange === 'custom') {
      return {
        from: fromDate ? startOfDay(parseISO(fromDate)).toISOString() : undefined,
        to: toDate ? endOfDay(parseISO(toDate)).toISOString() : undefined
      }
    }

    let from: Date | undefined
    let to: Date | undefined

    if (timeRange === '30m') from = subMinutes(now, 30)
    else if (timeRange === '1h') from = subHours(now, 1)
    else if (timeRange === '6h') from = subHours(now, 6)
    else if (timeRange === '24h') from = subHours(now, 24)
    else if (timeRange === 'today') from = startOfDay(now)
    else if (timeRange === 'yesterday') {
      from = startOfDay(subDays(now, 1))
      to = endOfDay(subDays(now, 1))
    } else if (timeRange === '3d') from = subDays(now, 3)
    else if (timeRange === '7d') from = subDays(now, 7)

    return {
      from: from?.toISOString(),
      to: to?.toISOString()
    }
  }, [timeRange, fromDate, toDate])

  const { data: pagedData, isLoading } = useDeadEventsPaged({
    search: search || undefined,
    eventType: eventType === 'all' ? undefined : eventType,
    fromDate: serverTimeRange.from,
    toDate: serverTimeRange.to,
    page: currentPage - 1,
    size: itemsPerPage
  })

  const events = pagedData?.data || []
  const totalPages = pagedData?.totalPages || 0

  const uniqueEventTypes = ['USER_INDEX_REQUESTED', 'USER_INDEX_DELETED']

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (searchInput) params.set('search', searchInput)
    if (eventTypeInput !== 'all') params.set('eventType', eventTypeInput)
    if (timeRangeInput !== 'all') params.set('timeRange', timeRangeInput)
    if (timeRangeInput === 'custom') {
      if (fromDateInput) params.set('fromDate', fromDateInput)
      if (toDateInput) params.set('toDate', toDateInput)
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleClearFilters = () => {
    setSearchParams({})
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    setSearchParams(params)
  }

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const hasAppliedFilters = search !== '' || eventType !== 'all' || timeRange !== 'all'

  return (
    <div className='flex flex-col gap-6 pb-10 animate-in fade-in duration-300'>
      <div className='flex flex-col gap-2 mb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate(PATHS.ADMIN.ELASTICSEARCH)}
              className='h-10 w-10 rounded-lg hover:bg-muted text-muted-foreground border border-transparent hover:border-border transition-all'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div className='flex flex-col'>
              <h1 className='text-2xl font-bold tracking-tight text-foreground uppercase'>{text.dlq.title}</h1>
              <p className='text-muted-foreground font-medium text-[13px]'>{text.dlq.subtitle}</p>
            </div>
          </div>
          <Button
            onClick={() =>
              retryMutation.mutate({
                fromDate: serverTimeRange.from,
                toDate: serverTimeRange.to
              })
            }
            disabled={retryMutation.isPending || (events?.length || 0) === 0}
            className='bg-primary hover:bg-primary-hover text-white gap-2.5 h-10 px-6 rounded-lg shadow-sm transition-all active:scale-95 tracking-wide'
            title={
              retryMutation.isPending
                ? undefined
                : (() => {
                    const filters: string[] = []
                    if (timeRange !== 'all') {
                      const timeLabels: Record<string, string> = {
                        '30m': text.dlq.last30m,
                        '1h': text.dlq.last1h,
                        '6h': text.dlq.last6h,
                        '24h': text.dlq.last24h,
                        today: text.dlq.today,
                        yesterday: text.dlq.yesterday,
                        '3d': text.dlq.last3d,
                        '7d': text.dlq.last7d,
                        custom: text.dlq.customRange
                      }
                      filters.push(`${text.dlq.tooltip.timeLabel}: ${timeLabels[timeRange] || timeRange}`)
                    }
                    if (eventType !== 'all') {
                      filters.push(`${text.dlq.tooltip.eventLabel}: ${eventType}`)
                    }
                    return filters.length > 0
                      ? `${text.dlq.tooltip.prefix}\n${filters.join('\n')}`
                      : text.dlq.tooltip.allPrefix
                  })()
            }
          >
            <RefreshCw className={cn('h-4 w-4', retryMutation.isPending && 'animate-spin')} />
            {retryMutation.isPending ? text.dlq.retrying : text.dlq.retryAll}
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5'>
        <div className='flex flex-1 flex-wrap items-center gap-4 w-full'>
          <div className='relative flex-1 min-w-[280px] max-w-sm'>
            <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50' />
            <input
              placeholder={text.dlq.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className='w-full pl-10 pr-4 h-10 border border-border rounded-lg bg-background text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/40 font-medium'
            />
          </div>

          <Select value={eventTypeInput} onValueChange={setEventTypeInput}>
            <SelectTrigger className='h-10 w-full md:w-[200px] text-sm text-foreground font-medium border-border bg-background rounded-lg focus:ring-4 focus:ring-primary/5 transition-all'>
              <SelectValue placeholder={text.dlq.allEvents} />
            </SelectTrigger>
            <SelectContent className='rounded-xl border-border shadow-xl'>
              <SelectItem value='all' className='text-[14px] font-medium'>
                {text.dlq.allEvents}
              </SelectItem>
              {uniqueEventTypes.map((type) => (
                <SelectItem key={type} value={type} className='text-[14px] font-medium'>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRangeInput} onValueChange={setTimeRangeInput}>
            <SelectTrigger className='h-10 w-full md:w-[160px] text-sm text-foreground font-medium border-border bg-background rounded-lg focus:ring-4 focus:ring-primary/5 transition-all'>
              <SelectValue placeholder={text.dlq.allTime} />
            </SelectTrigger>
            <SelectContent className='rounded-xl border-border shadow-xl'>
              <SelectItem value='all' className='text-[14px] font-medium'>
                {text.dlq.allTime}
              </SelectItem>
              <SelectItem value='30m' className='text-[14px] font-medium'>
                {text.dlq.last30m}
              </SelectItem>
              <SelectItem value='1h' className='text-[14px] font-medium'>
                {text.dlq.last1h}
              </SelectItem>
              <SelectItem value='6h' className='text-[14px] font-medium'>
                {text.dlq.last6h}
              </SelectItem>
              <SelectItem value='24h' className='text-[14px] font-medium'>
                {text.dlq.last24h}
              </SelectItem>
              <SelectItem value='today' className='text-[14px] font-medium'>
                {text.dlq.today}
              </SelectItem>
              <SelectItem value='yesterday' className='text-[14px] font-medium'>
                {text.dlq.yesterday}
              </SelectItem>
              <SelectItem value='3d' className='text-[14px] font-medium'>
                {text.dlq.last3d}
              </SelectItem>
              <SelectItem value='7d' className='text-[14px] font-medium'>
                {text.dlq.last7d}
              </SelectItem>
              <SelectItem value='custom' className='text-[14px] font-medium'>
                {text.dlq.customRange}
              </SelectItem>
            </SelectContent>
          </Select>

          {timeRangeInput === 'custom' && (
            <div className='flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300 w-full md:w-auto mt-2 md:mt-0'>
              <input
                type='date'
                value={fromDateInput}
                onChange={(e) => setFromDateInput(e.target.value)}
                className='h-10 flex-1 md:w-36 px-3 border border-border rounded-lg bg-background text-sm font-medium focus:outline-none focus:border-primary/50'
              />
              <span className='text-muted-foreground text-[11px] font-black uppercase'>{text.dlq.to}</span>
              <input
                type='date'
                value={toDateInput}
                onChange={(e) => setToDateInput(e.target.value)}
                className='h-10 flex-1 md:w-36 px-3 border border-border rounded-lg bg-background text-sm font-medium focus:outline-none focus:border-primary/50'
              />
            </div>
          )}
        </div>

        <div className='flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0'>
          {hasAppliedFilters && (
            <Button
              variant='ghost'
              onClick={handleClearFilters}
              className='h-10 text-muted-foreground px-5 hover:bg-muted rounded-lg transition-colors'
            >
              <RefreshCw className='h-3.5 w-3.5 mr-2 opacity-60' />
              {text.dlq.clearFilters}
            </Button>
          )}
          <Button
            onClick={handleApplyFilters}
            className='h-10 px-8 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-sm tracking-wider transition-all active:scale-95'
          >
            <Search className='h-4 w-4 mr-2' />
            {text.dlq.filterButton}
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-md shadow-sm border border-border/60 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 border-b border-border/60 hover:bg-muted/30'>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4 px-6 w-16 text-center'>
                {text.dlq.table.stt}
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4'>
                {text.dlq.table.aggregateId}
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4'>
                {text.dlq.table.eventType}
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4'>
                {text.dlq.table.errorMessage}
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4 text-center'>
                {text.dlq.table.status}
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4 text-right'>
                {text.dlq.table.updatedAt}
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4 text-right px-6'>
                {text.dlq.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className='h-12 border-b border-border/40'>
                  <TableCell colSpan={7} className='px-6'>
                    <div className='h-4 bg-muted animate-pulse rounded-md w-full' />
                  </TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-32 text-center text-muted-foreground text-[13px] italic'>
                  {text.dlq.noData}
                </TableCell>
              </TableRow>
            ) : (
              events.map((event, index) => (
                <TableRow
                  key={event.id}
                  className='h-14 border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors'
                >
                  <TableCell className='px-6 text-center font-mono text-[13px] text-muted-foreground'>
                    {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell className='font-mono font-bold text-[13px] text-foreground tracking-tight'>
                    {event.aggregateId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className='bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase border-blue-200/50 dark:border-blue-800/20 px-2 py-0'
                    >
                      {event.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-[250px]'>
                    <span
                      className='text-[13px] font-medium text-red-500 line-clamp-1'
                      title={event.errorMessage || ''}
                    >
                      {event.errorMessage || text.dlq.unknownError}
                    </span>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge className='bg-emerald-500 text-white border-transparent px-3 h-5 rounded-md uppercase text-[10px] font-bold shadow-none'>
                      {text.dlq.status.new}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <span className='text-[13px] font-mono font-bold text-muted-foreground'>
                      {formatFullDateTime(event.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className='text-right px-6'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground/60 hover:text-foreground rounded-md'
                        >
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-40 rounded-md shadow-xl border-border/60'>
                        <DropdownMenuItem
                          onClick={() => setSelectedEventId(event.id)}
                          className='text-sm cursor-pointer font-medium rounded-sm'
                        >
                          {text.dlq.actions.viewDetail}
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-sm text-destructive-text cursor-pointer font-medium rounded-sm'>
                          {text.dlq.actions.cancelRecord}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className='flex items-center justify-between p-4 bg-muted/10 border-t border-border/60'>
          <div className='text-[13px] font-medium text-muted-foreground'>
            {text.dlq.pagination.showing}{' '}
            <span className='text-foreground font-bold'>
              {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, pagedData?.totalItems || 0)}
            </span>{' '}
            {text.dlq.pagination.of} <span className='text-foreground font-bold'>{pagedData?.totalItems || 0}</span>{' '}
            {text.dlq.pagination.incidents}
          </div>

          <PaginationCustom currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      <DeadEventDetailModal
        isOpen={!!selectedEventId}
        onOpenChange={(open) => !open && setSelectedEventId(null)}
        eventId={selectedEventId}
        events={events}
      />
    </div>
  )
}
