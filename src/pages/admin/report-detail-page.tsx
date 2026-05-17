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
  XCircle,
  Trash2,
  EyeOff,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
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
import { usePostById } from '@/features/social-feed/queries/use-queries'
import { PostCard } from '@/features/social-feed/components/post/post-card'

const actionStyles: Record<AdminAction, string> = {
  DELETE_CONTENT: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800',
  HIDE_CONTENT: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800',
  WARN_USER: 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800',
  DISMISS_REPORT: 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800'
}

const actionIcons: Record<AdminAction, any> = {
  DELETE_CONTENT: Trash2,
  HIDE_CONTENT: EyeOff,
  WARN_USER: AlertTriangle,
  DISMISS_REPORT: CheckCircle
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

  const { data: postData, isLoading: loadingPost } = usePostById(targetType === 'POST' ? targetId : '')

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
    <div className='flex h-full flex-col min-h-0 bg-background'>
      {/* Scrollable Content Area */}
      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-7xl px-4 py-6 space-y-6'>
          {/* Header Area */}
          <div className='shrink-0 space-y-6 mb-6'>
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
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
            {/* Left Column: Reported Content */}
            <div className='lg:col-span-7 space-y-6'>
              {targetType === 'POST' ? (
                loadingPost ? (
                  <div className='flex items-center justify-center p-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                  </div>
                ) : postData ? (
                  <div className='space-y-3'>
                    <p className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground px-1'>
                      <MessageSquareText className='h-4 w-4' /> {text.processDialog.reportedContent}
                    </p>
                    <PostCard post={postData} hideLikeShare />
                  </div>
                ) : null
              ) : (
                <Card className='p-5 space-y-3 shadow-sm border-zinc-200/60 dark:border-white/10'>
                  {loadingReports && !summary ? (
                    <div className='space-y-3'>
                      <Skeleton className='h-5 w-40' />
                      <Skeleton className='h-24 w-full' />
                    </div>
                  ) : summary?.contentText ? (
                    <div>
                      <p className='mb-3 flex items-center gap-1.5 text-sm font-medium'>
                        <MessageSquareText className='h-4 w-4' /> {text.processDialog.reportedContent}
                      </p>
                      <p className='rounded-md bg-accent/40 p-4 text-[15px] leading-relaxed whitespace-pre-wrap border border-zinc-100 dark:border-white/5'>
                        {summary.contentText}
                      </p>
                      {summary.contentAuthorInfo && (
                        <p className='mt-3 flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <UserRound className='h-3.5 w-3.5' />
                          {text.processDialog.contentAuthorLabel}: <span className='font-medium'>{summary.contentAuthorInfo.fullName}</span>
                        </p>
                      )}
                    </div>
                  ) : null}

                  {summary?.contentMediaUrls && summary.contentMediaUrls.length > 0 && (
                    <div className='pt-2'>
                      <p className='mb-3 flex items-center gap-1.5 text-sm font-medium'>
                        <ImageIcon className='h-4 w-4' /> {text.processDialog.media(summary.contentMediaUrls.length)}
                      </p>
                      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                        {summary.contentMediaUrls.map((url, i) => (
                          <a key={i} href={url} target='_blank' rel='noreferrer' className='group block overflow-hidden rounded-lg border'>
                            <img
                              src={url}
                              alt={text.processDialog.mediaPreviewAlt(i + 1)}
                              className='h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105'
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right Column: Reporters */}
            <div className='lg:col-span-5 space-y-6'>
              {/* Reporters list */}
              <Card className='shadow-sm border-zinc-200/60 dark:border-white/10 flex flex-col overflow-hidden'>
                <div className='flex items-center justify-between border-b bg-muted/20 px-5 py-4 shrink-0'>
                  <p className='font-semibold text-[15px]'>{text.processDialog.reportersTitle}</p>
                  {!loadingReports && summary && (
                    <Badge variant='secondary' className='rounded-full px-3'>{text.processDialog.reportCount(summary.totalReports)}</Badge>
                  )}
                </div>

                <div className='divide-y flex-1 max-h-[600px] overflow-y-auto no-scrollbar'>
                  {loadingReports ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className='flex items-start gap-4 p-5'>
                        <Skeleton className='h-10 w-10 rounded-full' />
                        <div className='flex-1 space-y-2.5'>
                          <Skeleton className='h-4 w-36' />
                          <Skeleton className='h-3 w-60' />
                          <Skeleton className='h-3 w-28' />
                        </div>
                        <Skeleton className='h-5 w-20' />
                      </div>
                    ))
                  ) : individualReports.length === 0 ? (
                    <div className='p-12 text-center text-sm text-muted-foreground'>
                      {text.processDialog.loadingReports}
                    </div>
                  ) : (
                    individualReports.map((report) => (
                      <div key={report.id} className='flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors'>
                        <UserAvatar
                          src={report.reporterInfo?.avatar}
                          name={report.reporterInfo?.fullName ?? '?'}
                          className='h-10 w-10 shrink-0 border border-zinc-200 dark:border-white/10'
                          fallbackClassName='bg-primary/10 text-primary text-sm font-semibold'
                        />
                        <div className='flex-1 min-w-0'>
                          <p className='text-[14px] font-semibold truncate text-foreground'>
                            {report.reporterInfo?.fullName ?? report.reporterId.slice(0, 10)}
                          </p>
                          {report.details && (
                            <p className='mt-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-3 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-md border border-zinc-100 dark:border-white/5'>
                              {report.details}
                            </p>
                          )}
                          <div className='mt-2.5 flex items-center justify-between'>
                            <p className='text-[11px] font-medium text-muted-foreground/80'>{formatDateTimeShort(report.createdAt)}</p>
                            <Badge variant='outline' className='shrink-0 text-[10px] px-2 py-0 h-5 font-semibold bg-background'>
                              {text.reasonLabels[report.reason]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {(isPending || processedReport?.adminAction) && (
        <div className='shrink-0 border-t bg-card/95 backdrop-blur shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] z-20 px-4 py-5'>
          <div className='mx-auto w-full max-w-7xl'>
            {isPending ? (
              <div className='flex flex-col lg:flex-row gap-8'>
                {/* Actions Grid */}
                <div className='flex-[2]'>
                  <label className='mb-3 block text-[15px] font-semibold text-foreground'>
                    {text.processDialog.actionRequiredLabel}
                  </label>
                  <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                    {(Object.keys(text.actionLabels) as AdminAction[]).map((key) => {
                      const selected = action === key
                      const ActionIcon = actionIcons[key]
                      return (
                        <button
                          key={key}
                          type='button'
                          onClick={() => setAction(key)}
                          className={cn(
                            'rounded-xl border p-4 text-left transition-all relative overflow-hidden group',
                            selected
                              ? `${actionStyles[key]} ring-2 ring-offset-1 ring-offset-background`
                              : 'border-zinc-200 dark:border-white/10 hover:border-primary/40 hover:bg-muted/50 bg-background'
                          )}
                        >
                          <div className='flex items-center gap-2.5 mb-2'>
                            <ActionIcon className={cn('h-5 w-5 transition-colors', selected ? '' : 'text-muted-foreground group-hover:text-foreground')} />
                            <p className={cn('font-semibold text-[14px] leading-tight', selected ? '' : 'text-foreground')}>{text.actionLabels[key]}</p>
                          </div>
                          <p className={cn('text-[12px] leading-snug', selected ? 'opacity-90' : 'text-muted-foreground')}>
                            {text.actionDescriptions[key]}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Note & Actions */}
                <div className='flex-[1] flex flex-col'>
                  <label className='mb-3 block text-[15px] font-semibold text-foreground'>{text.processDialog.noteOptionalLabel}</label>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={text.processDialog.notePlaceholder}
                    className='flex-1 resize-none bg-background'
                    maxLength={300}
                  />
                  
                  <div className='mt-4 flex items-center justify-between'>
                    <p className='text-xs text-muted-foreground font-medium'>{adminNote.length}/300</p>
                    <div className='flex gap-3'>
                      <Button variant='outline' onClick={() => navigate(PATHS.ADMIN.REPORTS)} disabled={mutation.isPending} className='px-6'>
                        {text.processDialog.cancelButton}
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!action || mutation.isPending}
                        className={cn('px-8 font-semibold', selectedActionStyle && !mutation.isPending ? selectedActionStyle : '')}
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
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
                <div>
                  <p className='text-[15px] font-semibold mb-2'>{text.processDialog.resultTitle}</p>
                  <div className='flex items-center gap-3'>
                    <span className='text-muted-foreground text-sm font-medium'>{text.processDialog.actionLabel}</span>
                    <Badge variant='secondary' className='px-3 py-1'>{processedReport!.adminAction && text.actionLabels[processedReport!.adminAction]}</Badge>
                  </div>
                </div>
                {processedReport!.adminNote && (
                  <div className='flex-1 max-w-2xl w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-muted/30 p-4'>
                    <span className='text-muted-foreground block mb-1.5 font-semibold text-[13px] uppercase tracking-wider'>{text.processDialog.adminNoteLabel}</span>
                    <p className='text-sm text-foreground'>{processedReport!.adminNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
