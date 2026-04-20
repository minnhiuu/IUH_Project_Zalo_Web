import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  ImageIcon,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useProcessTargetReportsMutation } from '@/features/report/queries/report-mutations'
import { useReportsByTarget } from '@/features/report/queries/report-queries'
import { useReportAdminText } from '@/features/report/i18n/use-report-admin-text'
import { showSuccessToast } from '@/utils/toast'
import { cn } from '@/lib/utils'
import { formatDateTimeShort } from '@/utils/date'
import { PATHS } from '@/constants/path'
import type {
  ContentReportSummary,
  AdminAction,
  ReportStatus,
  TargetType
} from '@/features/report/schemas/report.schema'

const actionStyles: Record<AdminAction, string> = {
  DELETE_CONTENT: 'border-red-300 bg-red-50 text-red-700',
  HIDE_CONTENT: 'border-amber-300 bg-amber-50 text-amber-700',
  WARN_USER: 'border-sky-300 bg-sky-50 text-sky-700',
  DISMISS_REPORT: 'border-slate-300 bg-slate-100 text-slate-700'
}

const statusVariant: Record<ReportStatus, 'destructive' | 'default' | 'secondary'> = {
  PENDING: 'destructive',
  RESOLVED: 'default',
  DISMISSED: 'secondary'
}

const statusIcon: Record<ReportStatus, typeof Clock3> = {
  PENDING: Clock3,
  RESOLVED: ShieldCheck,
  DISMISSED: XCircle
}

export default function ReportDetailPage() {
  const { targetType, targetId } = useParams<{ targetType: string; targetId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { text } = useReportAdminText()
  const [action, setAction] = useState<AdminAction | ''>('')
  const [adminNote, setAdminNote] = useState('')

  // Summary passed from the list page via navigation state for instant display
  const stateSummary = location.state?.summary as ContentReportSummary | undefined

  const mutation = useProcessTargetReportsMutation()

  const { data: targetReportsData, isLoading: loadingReports } = useReportsByTarget(targetType as TargetType, targetId)
  const individualReports = targetReportsData?.data?.data ?? []

  // Derive summary metadata from individual reports when state summary is unavailable
  const firstReport = individualReports[0]
  const summary: ContentReportSummary | undefined =
    stateSummary ??
    (firstReport
      ? {
          targetId: firstReport.targetId,
          targetType: firstReport.targetType,
          totalReports: individualReports.length,
          pendingCount: individualReports.filter((r) => r.status === 'PENDING').length,
          resolvedCount: individualReports.filter((r) => r.status === 'RESOLVED').length,
          dismissedCount: individualReports.filter((r) => r.status === 'DISMISSED').length,
          reasons: [...new Set(individualReports.map((r) => r.reason))],
          latestReportAt: individualReports[0]?.createdAt ?? '',
          contentText: firstReport.contentText,
          contentMediaUrls: firstReport.contentMediaUrls,
          contentAuthorId: firstReport.contentAuthorId,
          contentAuthorInfo: firstReport.contentAuthorInfo,
          overallStatus: individualReports.some((r) => r.status === 'PENDING')
            ? 'PENDING'
            : individualReports.some((r) => r.status === 'RESOLVED')
              ? 'RESOLVED'
              : 'DISMISSED'
        }
      : undefined)

  const isPending = summary?.overallStatus === 'PENDING'
  const selectedActionLabel = action ? text.actionLabels[action] : null
  const selectedActionStyle = action ? actionStyles[action] : null
  const processedReport = individualReports.find((r) => r.adminAction)

  const handleSubmit = () => {
    if (!summary || !action) return
    mutation.mutate(
      { targetId: summary.targetId, targetType: summary.targetType, action, adminNote: adminNote || undefined },
      {
        onSuccess: () => {
          showSuccessToast(text.processDialog.successToast)
          navigate(PATHS.ADMIN.REPORTS)
        }
      }
    )
  }

  const StatusIcon = summary ? statusIcon[summary.overallStatus] : null

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6 pb-10'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate(PATHS.ADMIN.REPORTS)}
          className='gap-1.5 text-muted-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          {text.page.backToReports}
        </Button>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-amber-100 p-2.5'>
            <AlertTriangle className='h-5 w-5 text-amber-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              {isPending ? text.processDialog.titlePending : text.processDialog.titleResolved}
            </h1>
            {summary && (
              <p className='text-sm text-muted-foreground'>
                {text.targetTypeLabels[summary.targetType]} • {targetId?.slice(0, 12)}…
              </p>
            )}
          </div>
        </div>
        {summary && StatusIcon && (
          <Badge variant={statusVariant[summary.overallStatus]} className='gap-1.5 px-3 py-1 text-sm'>
            <StatusIcon className='h-3.5 w-3.5' />
            {text.statusLabels[summary.overallStatus]}
          </Badge>
        )}
      </div>

      {/* Reported content */}
      <Card className='p-4 space-y-3'>
        {loadingReports && !summary ? (
          <div className='space-y-3'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-24 w-full' />
          </div>
        ) : summary?.contentText ? (
          <div>
            <p className='mb-2 flex items-center gap-1.5 text-sm font-medium'>
              <MessageSquareText className='h-4 w-4' /> {text.processDialog.reportedContent}
            </p>
            <p className='rounded-md bg-accent/50 p-3 text-sm leading-relaxed whitespace-pre-wrap'>
              {summary.contentText}
            </p>
            {summary.contentAuthorInfo && (
              <p className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
                <UserRound className='h-3.5 w-3.5' />
                {text.processDialog.contentAuthorLabel}: {summary.contentAuthorInfo.fullName}
              </p>
            )}
          </div>
        ) : null}

        {summary?.contentMediaUrls && summary.contentMediaUrls.length > 0 && (
          <div>
            <p className='mb-2 flex items-center gap-1.5 text-sm font-medium'>
              <ImageIcon className='h-4 w-4' /> {text.processDialog.media(summary.contentMediaUrls.length)}
            </p>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
              {summary.contentMediaUrls.map((url, i) => (
                <a key={i} href={url} target='_blank' rel='noreferrer'>
                  <img
                    src={url}
                    alt={text.processDialog.mediaPreviewAlt(i + 1)}
                    className='h-28 w-full rounded-md border object-cover'
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Reporters list */}
      <Card>
        <div className='flex items-center justify-between border-b bg-muted/20 px-4 py-3'>
          <p className='font-medium'>{text.processDialog.reportersTitle}</p>
          {!loadingReports && summary && (
            <Badge variant='outline'>{text.processDialog.reportCount(summary.totalReports)}</Badge>
          )}
        </div>

        <div className='divide-y'>
          {loadingReports ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex items-start gap-3 p-4'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-60' />
                  <Skeleton className='h-3 w-28' />
                </div>
                <Skeleton className='h-5 w-20' />
              </div>
            ))
          ) : individualReports.length === 0 ? (
            <p className='p-6 text-center text-sm text-muted-foreground'>{text.processDialog.loadingReports}</p>
          ) : (
            individualReports.map((report) => (
              <div key={report.id} className='flex items-start gap-3 p-4'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold'>
                  {(report.reporterInfo?.fullName ?? '?')[0].toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium'>
                    {report.reporterInfo?.fullName ?? report.reporterId.slice(0, 10)}
                  </p>
                  {report.details && <p className='mt-0.5 text-sm text-muted-foreground'>{report.details}</p>}
                  <p className='mt-1 text-xs text-muted-foreground'>{formatDateTimeShort(report.createdAt)}</p>
                </div>
                <Badge variant='outline' className='shrink-0 text-xs'>
                  {text.reasonLabels[report.reason]}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Processing result (when already resolved/dismissed) */}
      {!isPending && processedReport?.adminAction && (
        <Card className='p-4'>
          <p className='mb-3 font-semibold'>{text.processDialog.resultTitle}</p>
          <div className='text-sm'>
            <span className='text-muted-foreground'>{text.processDialog.actionLabel}</span>
            <Badge className='ml-2'>{text.actionLabels[processedReport.adminAction]}</Badge>
          </div>
          {processedReport.adminNote && (
            <div className='mt-3 text-sm'>
              <span className='text-muted-foreground'>{text.processDialog.adminNoteLabel}</span>
              <p className='mt-1 rounded-md bg-muted/40 p-3'>{processedReport.adminNote}</p>
            </div>
          )}
        </Card>
      )}

      {/* Action section (only when pending) */}
      {isPending && (
        <Card className='p-4 space-y-4'>
          <Separator />
          <div>
            <label className='mb-3 block font-medium'>{text.processDialog.actionRequiredLabel}</label>
            <div className='grid gap-3 sm:grid-cols-2'>
              {(Object.keys(text.actionLabels) as AdminAction[]).map((key) => {
                const selected = action === key
                return (
                  <button
                    key={key}
                    type='button'
                    onClick={() => setAction(key)}
                    className={cn(
                      'rounded-lg border px-4 py-3 text-left transition-all',
                      selected
                        ? `${actionStyles[key]} ring-2 ring-offset-1`
                        : 'hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <p className='font-semibold'>{text.actionLabels[key]}</p>
                    <p className='mt-1 text-sm text-muted-foreground'>{text.actionDescriptions[key]}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className='mb-1.5 block text-sm font-medium'>{text.processDialog.noteOptionalLabel}</label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={text.processDialog.notePlaceholder}
              rows={4}
              maxLength={300}
            />
            <p className='mt-1 text-right text-xs text-muted-foreground'>{adminNote.length}/300</p>
          </div>

          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={() => navigate(PATHS.ADMIN.REPORTS)} disabled={mutation.isPending}>
              {text.processDialog.cancelButton}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!action || mutation.isPending}
              className={cn(selectedActionStyle ?? '')}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {text.processDialog.processingButton}
                </>
              ) : selectedActionLabel ? (
                text.processDialog.confirmWithAction(selectedActionLabel)
              ) : (
                text.processDialog.confirmButton
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
