import { AlertTriangle, Clock3, Eye, FileWarning, Gavel, ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaginationCustom } from '@/components/ui/pagination-custom'
import { useReportAdminText } from '@/features/report/i18n/use-report-admin-text'
import { cn } from '@/lib/utils'
import type { ContentReportSummary, ReportStatus, ReportReason } from '@/features/report/schemas/report.schema'
import type { PageResponse } from '@/shared/api'
import { formatDateTimeShort } from '@/utils/date'

type ReportsTableProps = {
  data?: PageResponse<ContentReportSummary>
  isLoading: boolean
  onProcess: (summary: ContentReportSummary) => void
  onViewWarnings: (userId: string) => void
  onPageChange: (page: number) => void
}

const statusVariant: Record<ReportStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'destructive',
  RESOLVED: 'default',
  DISMISSED: 'secondary'
}

const statusClasses: Record<ReportStatus, string> = {
  PENDING: 'border-amber-300 bg-amber-50 text-amber-700',
  RESOLVED: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  DISMISSED: 'border-slate-300 bg-slate-100 text-slate-700'
}

const reasonClasses: Record<ReportReason, string> = {
  SPAM: 'border-sky-300 bg-sky-50 text-sky-700',
  HARASSMENT: 'border-violet-300 bg-violet-50 text-violet-700',
  HATE_SPEECH: 'border-rose-300 bg-rose-50 text-rose-700',
  VIOLENCE: 'border-red-300 bg-red-50 text-red-700',
  NUDITY: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700',
  MISINFORMATION: 'border-yellow-300 bg-yellow-50 text-yellow-700',
  OTHER: 'border-gray-300 bg-gray-100 text-gray-700'
}

const statusIcon: Record<ReportStatus, typeof Clock3> = {
  PENDING: Clock3,
  RESOLVED: ShieldCheck,
  DISMISSED: XCircle
}

export function ReportsTable({ data, isLoading, onProcess, onViewWarnings, onPageChange }: ReportsTableProps) {
  const { text } = useReportAdminText()

  if (isLoading)
    return (
      <TableSkeleton
        headers={[
          text.table.no,
          text.table.targetType,
          text.table.content,
          text.table.reports,
          text.table.reason,
          text.table.status,
          text.table.latestReport,
          text.table.actions
        ]}
      />
    )

  if (!data || data.data.length === 0) {
    return (
      <div className='rounded-xl border border-dashed bg-muted/20 py-14 text-center'>
        <div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
          <FileWarning className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='font-medium'>{text.table.emptyTitle}</p>
        <p className='mt-1 text-sm text-muted-foreground'>{text.table.emptySubtitle}</p>
      </div>
    )
  }

  const startItem = data.totalItems === 0 ? 0 : data.page * data.limit + 1
  const endItem = Math.min((data.page + 1) * data.limit, data.totalItems)

  const renderReportCountBadges = (summary: ContentReportSummary) => (
    <div className='flex flex-wrap items-center gap-1'>
      <span className='text-sm font-semibold'>{summary.totalReports}</span>
      {summary.pendingCount > 0 && (
        <Badge variant='outline' className='h-5 border-amber-300 bg-amber-50 px-1.5 text-[10px] text-amber-700'>
          {summary.pendingCount} P
        </Badge>
      )}
      {summary.resolvedCount > 0 && (
        <Badge variant='outline' className='h-5 border-emerald-300 bg-emerald-50 px-1.5 text-[10px] text-emerald-700'>
          {summary.resolvedCount} R
        </Badge>
      )}
      {summary.dismissedCount > 0 && (
        <Badge variant='outline' className='h-5 border-slate-300 bg-slate-100 px-1.5 text-[10px] text-slate-700'>
          {summary.dismissedCount} D
        </Badge>
      )}
    </div>
  )

  const renderReasonBadges = (summary: ContentReportSummary) => {
    const reasons = summary.reasons ?? []
    const visible = reasons.slice(0, 3)
    const extra = reasons.length - visible.length
    return (
      <div className='flex flex-wrap gap-1'>
        {visible.map((r) => (
          <Badge key={r} variant='outline' className={cn('text-xs', reasonClasses[r])}>
            {text.reasonLabels[r]}
          </Badge>
        ))}
        {extra > 0 && (
          <Badge variant='outline' className='text-xs text-muted-foreground'>
            +{extra}
          </Badge>
        )}
      </div>
    )
  }

  const renderActionButtons = (summary: ContentReportSummary, compact = false) => (
    <div className={cn('flex items-center gap-1', compact ? 'justify-start' : 'justify-end')}>
      {summary.overallStatus === 'PENDING' && (
        <Button
          variant='default'
          size='sm'
          onClick={() => onProcess(summary)}
          title={text.table.processAction}
          className='h-8 px-2.5 text-xs'
        >
          <Gavel className='h-3.5 w-3.5' />
          <span className='ml-1 hidden sm:inline'>{text.table.processAction}</span>
        </Button>
      )}
      {summary.contentAuthorId && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onViewWarnings(summary.contentAuthorId!)}
          title={text.table.viewWarningsAction}
          className='h-8 w-8 p-0 text-amber-600 hover:text-amber-700'
        >
          <AlertTriangle className='h-4 w-4' />
        </Button>
      )}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onProcess(summary)}
        title={text.table.viewDetailAction}
        className='h-8 w-8 p-0'
      >
        <Eye className='h-4 w-4' />
      </Button>
    </div>
  )

  return (
    <div className='space-y-4'>
      {/* Mobile cards */}
      <div className='space-y-3 md:hidden'>
        {data.data.map((summary, index) => {
          const StatusIcon = statusIcon[summary.overallStatus]
          return (
            <article key={summary.targetId} className='rounded-xl border bg-card p-4 shadow-sm'>
              <div className='mb-3 flex items-start justify-between gap-2'>
                <div>
                  <p className='text-xs text-muted-foreground'>#{data.page * data.limit + index + 1}</p>
                  <Badge variant='outline' className='mt-1 text-xs'>
                    {text.targetTypeLabels[summary.targetType]}
                  </Badge>
                </div>
                <Badge
                  variant={statusVariant[summary.overallStatus]}
                  className={cn('gap-1 border', statusClasses[summary.overallStatus])}
                >
                  <StatusIcon className='h-3 w-3' />
                  {text.statusLabels[summary.overallStatus]}
                </Badge>
              </div>

              <div className='rounded-lg border bg-muted/20 p-3'>
                <p className='line-clamp-2 text-sm leading-relaxed'>
                  {summary.contentText || text.table.noTextContent}
                </p>
                {summary.contentAuthorInfo && (
                  <p className='mt-2 text-xs text-muted-foreground'>
                    {text.table.byPrefix} {summary.contentAuthorInfo.fullName}
                  </p>
                )}
              </div>

              <div className='mt-3 flex flex-wrap gap-2'>{renderReasonBadges(summary)}</div>

              <div className='mt-3 flex items-center justify-between gap-2'>
                <div className='space-y-1'>
                  {renderReportCountBadges(summary)}
                  <p className='text-xs text-muted-foreground'>{formatDateTimeShort(summary.latestReportAt)}</p>
                </div>
                {renderActionButtons(summary, true)}
              </div>
            </article>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className='hidden overflow-hidden rounded-lg border md:block'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10 font-bold'>{text.table.no}</TableHead>
                <TableHead className='font-bold'>{text.table.targetType}</TableHead>
                <TableHead className='min-w-60 font-bold'>{text.table.content}</TableHead>
                <TableHead className='font-bold'>{text.table.reports}</TableHead>
                <TableHead className='font-bold'>{text.table.reason}</TableHead>
                <TableHead className='font-bold'>{text.table.status}</TableHead>
                <TableHead className='font-bold'>{text.table.latestReport}</TableHead>
                <TableHead className='text-right font-bold'>{text.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((summary, index) => (
                <TableRow key={summary.targetId}>
                  <TableCell className='font-medium text-muted-foreground'>
                    {data.page * data.limit + index + 1}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='text-xs'>
                      {text.targetTypeLabels[summary.targetType]}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-80'>
                    <p className='line-clamp-2 text-sm leading-relaxed'>
                      {summary.contentText || text.table.noContent}
                    </p>
                    {summary.contentAuthorInfo && (
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {text.table.byPrefix} {summary.contentAuthorInfo.fullName}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{renderReportCountBadges(summary)}</TableCell>
                  <TableCell>{renderReasonBadges(summary)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[summary.overallStatus]}
                      className={cn('gap-1 border text-xs', statusClasses[summary.overallStatus])}
                    >
                      {(() => {
                        const Icon = statusIcon[summary.overallStatus]
                        return <Icon className='h-3 w-3' />
                      })()}
                      {text.statusLabels[summary.overallStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {formatDateTimeShort(summary.latestReportAt)}
                  </TableCell>
                  <TableCell>{renderActionButtons(summary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className='flex flex-col gap-3 rounded-md border border-border/60 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='text-sm font-medium text-muted-foreground'>
          {text.table.showingRange(startItem, endItem, data.totalItems)}
        </div>
        <PaginationCustom
          currentPage={data.page + 1}
          totalPages={data.totalPages}
          onPageChange={(page) => onPageChange(page - 1)}
        />
      </div>
    </div>
  )
}

function TableSkeleton({ headers }: { headers: string[] }) {
  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h, idx) => (
                <TableHead key={idx} className='font-bold'>
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className='h-4 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
