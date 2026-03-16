import { useState } from 'react'
import { RefreshCw, MoreVertical, ArrowLeft, Search, RotateCcw, AlertCircle, PlayCircle, Info } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { PATHS } from '@/constants/path'
import { useFailedEventsPaged } from '../queries/use-queries'
import {
  useUpdateFailedEventResolved,
  useRetryFailedEvent,
  useRetryAllFailedEvents,
  useRetryFailedEventsByDuration
} from '../queries/use-mutations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ELASTICSEARCH_KEYS } from '../i18n/elasticsearch.keys'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FailedEventDetailModal } from './failed-events-modal'
import { PaginationCustom } from '@/components/ui/pagination-custom'
import { formatFullDateTime } from '@/utils/date'
import { Checkbox } from '@/components/ui/checkbox'
import { useRetryFailedEventsBulk } from '../queries/use-mutations'
import { cn } from '@/lib/utils'

export const FailedEventsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { text, t } = useElasticsearchText()

  const updateResolvedMutation = useUpdateFailedEventResolved()
  const retryEventMutation = useRetryFailedEvent()
  const retryAllMutation = useRetryAllFailedEvents()
  const retryDurationMutation = useRetryFailedEventsByDuration()
  const retryBulkMutation = useRetryFailedEventsBulk()

  const resolvedParam = searchParams.get('resolved')
  const hoursParam = searchParams.get('hours') || 'all'
  const keyword = searchParams.get('keyword') || ''
  const currentPage = parseInt(searchParams.get('page') || '1')

  const [filters, setFilters] = useState({
    resolved: resolvedParam || 'all',
    keyword: keyword,
    hours: hoursParam
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [prevParams, setPrevParams] = useState({
    resolved: resolvedParam || 'all',
    hours: hoursParam,
    keyword: keyword
  })

  if (
    prevParams.resolved !== (resolvedParam || 'all') ||
    prevParams.hours !== hoursParam ||
    prevParams.keyword !== keyword
  ) {
    setPrevParams({ resolved: resolvedParam || 'all', hours: hoursParam, keyword: keyword })
    setFilters({ resolved: resolvedParam || 'all', keyword: keyword, hours: hoursParam })
  }

  const itemsPerPage = 10

  const { data: pagedData, isLoading } = useFailedEventsPaged({
    resolved: resolvedParam === 'true' ? true : resolvedParam === 'false' ? false : undefined,
    keyword: keyword,
    hours: hoursParam === 'all' ? undefined : parseInt(hoursParam),
    page: currentPage - 1,
    size: itemsPerPage
  })

  const events = pagedData?.data || []
  const totalPages = pagedData?.totalPages || 0

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (filters.resolved !== 'all') params.set('resolved', filters.resolved)
    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.hours !== 'all') params.set('hours', filters.hours)
    params.set('page', '1')
    setSearchParams(params)
    setSelectedIds([])
  }

  const handleClearFilters = () => {
    setSearchParams({})
    setSelectedIds([])
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    setSearchParams(params)
    setSelectedIds([])
  }

  const toggleSelectAll = () => {
    const unresolvedEvents = events.filter((e) => !e.resolved)
    if (selectedIds.length === unresolvedEvents.length && unresolvedEvents.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(unresolvedEvents.map((e) => e.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleBulkRetry = () => {
    const unresolvedSelectedIds = selectedIds.filter((id) => {
      const event = events.find((e) => e.id === id)
      return event && !event.resolved
    })

    if (unresolvedSelectedIds.length === 0) return

    retryBulkMutation.mutate(unresolvedSelectedIds, {
      onSuccess: () => setSelectedIds([])
    })
  }

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const hasAppliedFilters = resolvedParam !== null || keyword !== '' || hoursParam !== 'all'

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
              <h1 className='text-2xl font-bold tracking-tight uppercase text-red-500'>{text.dlq.title}</h1>
              <p className='text-muted-foreground font-medium text-[13px]'>{text.dlq.subtitle}</p>
            </div>
          </div>
          <Button
            onClick={() => retryAllMutation.mutate()}
            disabled={retryAllMutation.isPending}
            variant='outline'
            className='h-10 px-6 rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
          >
            <RotateCcw className={cn('h-4 w-4 mr-2', retryAllMutation.isPending && 'animate-spin')} />
            {text.dlq.retryAll}
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col md:flex-row items-end justify-between gap-5'>
        <div className='flex flex-1 flex-wrap items-end gap-4 w-full'>
          <div className='flex flex-col gap-1.5 flex-1 min-w-[300px]'>
            <span className='text-[11px] font-bold text-muted-foreground uppercase px-1'>
              {text.dlq.searchPlaceholder}
            </span>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50' />
              <Input
                value={filters.keyword}
                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                placeholder={text.dlq.searchPlaceholder}
                className='h-10 pl-9 border-border bg-background rounded-lg text-sm font-medium focus-visible:ring-primary/20'
              />
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <span className='text-[11px] font-bold text-muted-foreground uppercase px-1'>{text.dlq.label.status}</span>
            <Select
              value={filters.resolved}
              onValueChange={(val) => setFilters((prev) => ({ ...prev, resolved: val }))}
            >
              <SelectTrigger className='h-10 w-[200px] text-sm text-foreground font-medium border-border bg-background rounded-lg focus:ring-4 focus:ring-primary/5 transition-all'>
                <SelectValue placeholder={text.dlq.label.status} />
              </SelectTrigger>
              <SelectContent className='rounded-xl border-border shadow-xl'>
                <SelectItem value='all' className='text-[14px] font-medium'>
                  {text.dlq.allEvents}
                </SelectItem>
                <SelectItem value='false' className='text-[14px] font-medium text-red-500'>
                  {text.dlq.status.unprocessed}
                </SelectItem>
                <SelectItem value='true' className='text-[14px] font-medium text-emerald-500'>
                  {text.dlq.status.processed}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-1.5'>
            <span className='text-[11px] font-bold text-muted-foreground uppercase px-1'>{text.dlq.label.time}</span>
            <div className='flex items-center gap-2'>
              <Select value={filters.hours} onValueChange={(val) => setFilters((prev) => ({ ...prev, hours: val }))}>
                <SelectTrigger className='h-10 w-[160px] text-sm text-foreground font-medium border-border bg-background rounded-lg'>
                  <SelectValue placeholder={text.dlq.label.time} />
                </SelectTrigger>
                <SelectContent className='rounded-xl border-border shadow-xl'>
                  <SelectItem value='all' className='text-[14px] font-medium'>
                    {text.dlq.allTime}
                  </SelectItem>
                  <SelectItem value='1'>{t(ELASTICSEARCH_KEYS.dlq.retryRangeXh, { hours: 1 })}</SelectItem>
                  <SelectItem value='6'>{t(ELASTICSEARCH_KEYS.dlq.retryRangeXh, { hours: 6 })}</SelectItem>
                  <SelectItem value='12'>{t(ELASTICSEARCH_KEYS.dlq.retryRangeXh, { hours: 12 })}</SelectItem>
                  <SelectItem value='24'>{t(ELASTICSEARCH_KEYS.dlq.retryRangeXh, { hours: 24 })}</SelectItem>
                  <SelectItem value='168'>{t(ELASTICSEARCH_KEYS.dlq.retryRangeXd, { days: 7 })}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='sm'
                onClick={() => retryDurationMutation.mutate(parseInt(filters.hours))}
                disabled={retryDurationMutation.isPending || filters.hours === 'all'}
                className='h-10 text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 italic'
              >
                <PlayCircle className='h-4 w-4 mr-1' />
                {text.dlq.retryRangeButton}
              </Button>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3 w-full md:w-auto justify-end md:pb-0'>
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
              <TableHead className='w-12 px-4'>
                <Checkbox
                  checked={
                    events.filter((e) => !e.resolved).length > 0 &&
                    selectedIds.length === events.filter((e) => !e.resolved).length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4 w-16 text-center'>
                {text.dlq.table.stt}
              </TableHead>
              <TableHead className='font-bold text-foreground/80 text-[13px] uppercase tracking-wider py-4 text-center'>
                Event ID
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
                  className={cn(
                    'h-14 border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors',
                    selectedIds.includes(event.id) && 'bg-primary/5'
                  )}
                >
                  <TableCell className='px-4'>
                    <Checkbox
                      checked={selectedIds.includes(event.id)}
                      onCheckedChange={() => toggleSelect(event.id)}
                      disabled={event.resolved}
                    />
                  </TableCell>
                  <TableCell className='text-center font-mono text-[13px] text-muted-foreground'>
                    {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell className='font-mono font-bold text-[13px] text-foreground tracking-tight'>
                    {event.eventId}
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
                    <div className='flex items-center gap-2'>
                      <span
                        className='text-[13px] font-medium text-red-500 line-clamp-1'
                        title={event.errorMessage || ''}
                      >
                        {event.errorMessage || text.dlq.unknownError}
                      </span>
                      {event.retryCount > 0 && (
                        <Badge variant='secondary' className='h-4 px-1 text-[9px] bg-orange-100 text-orange-700'>
                          {text.dlq.table.retryCount}: {event.retryCount}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      className={cn(
                        'px-3 h-5 rounded-md uppercase text-[10px] font-bold shadow-none',
                        !event.resolved ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                      )}
                    >
                      {!event.resolved ? text.dlq.status.unprocessed : text.dlq.status.processed}
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
                      <DropdownMenuContent align='end' className='w-48 rounded-md shadow-xl border-border/60'>
                        <DropdownMenuItem
                          onClick={() => setSelectedEventId(event.id)}
                          className='text-sm cursor-pointer font-medium rounded-sm'
                        >
                          <Info className='h-4 w-4 mr-2 opacity-60' />
                          {text.dlq.actions.viewDetail}
                        </DropdownMenuItem>
                        {!event.resolved && (
                          <>
                            <DropdownMenuItem
                              onClick={() => retryEventMutation.mutate(event.id)}
                              className='text-sm text-orange-600 cursor-pointer font-medium rounded-sm'
                            >
                              <RotateCcw className='h-4 w-4 mr-2 opacity-60' />
                              {text.dlq.actions.retrySingle}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateResolvedMutation.mutate({ id: event.id, resolved: true })}
                              className='text-sm text-emerald-600 cursor-pointer font-medium rounded-sm'
                            >
                              <PlayCircle className='h-4 w-4 mr-2 opacity-60' />
                              {text.dlq.actions.markResolved}
                            </DropdownMenuItem>
                          </>
                        )}
                        {event.resolved && (
                          <DropdownMenuItem
                            onClick={() => updateResolvedMutation.mutate({ id: event.id, resolved: false })}
                            className='text-sm text-red-600 cursor-pointer font-medium rounded-sm'
                          >
                            <AlertCircle className='h-4 w-4 mr-2 opacity-60' />
                            {text.dlq.actions.markUnprocessed}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className='flex items-center justify-between p-4 bg-muted/10 border-t border-border/60'>
          <div className='flex items-center gap-4 text-[13px] font-medium text-muted-foreground'>
            {selectedIds.length > 0 ? (
              <div className='flex items-center gap-3 animate-in fade-in slide-in-from-left-2'>
                <span>{t(ELASTICSEARCH_KEYS.dlq.bulk.selectedCount, { count: selectedIds.length })}</span>
                <Button
                  size='sm'
                  onClick={handleBulkRetry}
                  disabled={retryBulkMutation.isPending}
                  className='h-8 bg-orange-500 hover:bg-orange-600'
                >
                  <RotateCcw className={cn('h-3.5 w-3.5 mr-1.5', retryBulkMutation.isPending && 'animate-spin')} />
                  {text.dlq.bulk.retrySelected}
                </Button>
              </div>
            ) : (
              <div>
                {text.dlq.pagination.showing}{' '}
                <span className='text-foreground font-bold'>
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, pagedData?.totalItems || 0)}
                </span>{' '}
                {text.dlq.pagination.of} <span className='text-foreground font-bold'>{pagedData?.totalItems || 0}</span>{' '}
                {text.dlq.pagination.incidents}
              </div>
            )}
          </div>

          <PaginationCustom currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      <FailedEventDetailModal
        isOpen={!!selectedEventId}
        onOpenChange={(open) => !open && setSelectedEventId(null)}
        eventId={selectedEventId}
        events={events}
        onRetry={(id) => retryEventMutation.mutate(id)}
        onMarkResolved={(id, resolved) => updateResolvedMutation.mutate({ id, resolved })}
        isRetrying={retryEventMutation.isPending}
        isUpdating={updateResolvedMutation.isPending}
      />
    </div>
  )
}
