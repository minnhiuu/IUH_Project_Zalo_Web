import { useState } from 'react'
import {
  AlertTriangle,
  Clock3,
  ImageIcon,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  XCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useProcessTargetReportsMutation } from '@/features/report/queries/report-mutations'
import { useReportsByTarget } from '@/features/report/queries/report-queries'
import { useReportAdminText } from '@/features/report/i18n/use-report-admin-text'
import { showSuccessToast } from '@/utils/toast'
import { cn } from '@/lib/utils'
import { formatDateTimeShort } from '@/utils/date'
import type { ContentReportSummary, AdminAction, ReportStatus } from '@/features/report/schemas/report.schema'
import { usePostById } from '@/features/social-feed/queries/use-queries'
import { PostCard } from '@/features/social-feed/components/post/post-card'

type ProcessReportDialogProps = {
  summary: ContentReportSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const actionStyles: Record<AdminAction, string> = {
  DELETE_CONTENT: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800',
  HIDE_CONTENT: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800',
  WARN_USER: 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800',
  DISMISS_REPORT: 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800'
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

export function ProcessReportDialog({ summary, open, onOpenChange }: ProcessReportDialogProps) {
  const [action, setAction] = useState<AdminAction | ''>('')
  const [adminNote, setAdminNote] = useState('')
  const { text } = useReportAdminText()
  const mutation = useProcessTargetReportsMutation()

  const { data: targetReportsData, isLoading: loadingReports } = useReportsByTarget(
    summary?.targetType,
    summary?.targetId
  )
  const individualReports = targetReportsData?.data?.data ?? []

  const { data: postData, isLoading: loadingPost } = usePostById(summary?.targetType === 'POST' ? summary.targetId : '')

  const handleSubmit = () => {
    if (!summary || !action) return
    mutation.mutate(
      { targetId: summary.targetId, targetType: summary.targetType, action, adminNote: adminNote || undefined },
      {
        onSuccess: () => {
          showSuccessToast(text.processDialog.successToast)
          onOpenChange(false)
          setAction('')
          setAdminNote('')
        }
      }
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAction('')
      setAdminNote('')
    }
    onOpenChange(nextOpen)
  }

  if (!summary) return null

  const isPending = summary.overallStatus === 'PENDING'
  const selectedActionLabel = action ? text.actionLabels[action] : null
  const selectedActionStyle = action ? actionStyles[action] : null

  // Find first resolved/dismissed report for showing result (when not pending)
  const processedReport = individualReports.find((r) => r.adminAction)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-amber-600' />
            {isPending ? text.processDialog.titlePending : text.processDialog.titleResolved}
          </DialogTitle>
          <DialogDescription className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className='text-xs'>
              {text.targetTypeLabels[summary.targetType]}
            </Badge>
            <span>â€¢</span>
            <Badge variant={statusVariant[summary.overallStatus]}>
              {(() => {
                const Icon = statusIcon[summary.overallStatus]
                return <Icon className='mr-1 h-3 w-3' />
              })()}
              {text.statusLabels[summary.overallStatus]}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Reported content */}
          {summary.targetType === 'POST' && loadingPost ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : summary.targetType === 'POST' && postData ? (
            <div className='rounded-lg border p-3 bg-muted/10'>
              <p className='mb-3 flex items-center gap-1.5 text-sm font-medium'>
                <MessageSquareText className='h-4 w-4' /> {text.processDialog.reportedContent}
              </p>
              <div className='rounded-xl overflow-hidden'>
                <PostCard post={postData} hideLikeShare />
              </div>
            </div>
          ) : summary.contentText && (
            <div className='rounded-lg border p-3'>
              <p className='mb-2 flex items-center gap-1.5 text-sm font-medium'>
                <MessageSquareText className='h-4 w-4' /> {text.processDialog.reportedContent}
              </p>
              <p className='max-h-36 overflow-y-auto rounded-md bg-accent/50 p-3 text-sm leading-relaxed'>
                {summary.contentText}
              </p>
              {summary.contentAuthorInfo && (
                <p className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <UserRound className='h-3.5 w-3.5' />
                  {text.processDialog.contentAuthorLabel}: {summary.contentAuthorInfo.fullName}
                </p>
              )}
            </div>
          )}

          {summary.targetType !== 'POST' && summary.contentMediaUrls && summary.contentMediaUrls.length > 0 && (
            <div className='rounded-lg border p-3'>
              <p className='mb-2 flex items-center gap-1.5 text-sm font-medium'>
                <ImageIcon className='h-4 w-4' /> {text.processDialog.media(summary.contentMediaUrls.length)}
              </p>
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                {summary.contentMediaUrls.slice(0, 4).map((url, i) => (
                  <a key={i} href={url} target='_blank' rel='noreferrer'>
                    <img
                      src={url}
                      alt={text.processDialog.mediaPreviewAlt(i + 1)}
                      className='h-24 w-full rounded-md border object-cover'
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reporters list */}
          <div className='rounded-lg border'>
            <div className='flex items-center justify-between border-b bg-muted/20 px-3 py-2'>
              <p className='text-sm font-medium'>{text.processDialog.reportersTitle}</p>
              {!loadingReports && (
                <Badge variant='outline' className='text-xs'>
                  {text.processDialog.reportCount(summary.totalReports)}
                </Badge>
              )}
            </div>

            <div className='max-h-64 overflow-y-auto divide-y'>
              {loadingReports ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex items-start gap-3 p-3'>
                    <Skeleton className='h-8 w-8 rounded-full' />
                    <div className='flex-1 space-y-1.5'>
                      <Skeleton className='h-3.5 w-32' />
                      <Skeleton className='h-3 w-48' />
                    </div>
                    <Skeleton className='h-5 w-16' />
                  </div>
                ))
              ) : individualReports.length === 0 ? (
                <p className='p-4 text-center text-sm text-muted-foreground'>{text.processDialog.loadingReports}</p>
              ) : (
                individualReports.map((report) => (
                  <div key={report.id} className='flex items-start gap-3 p-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold'>
                      {(report.reporterInfo?.fullName ?? '?')[0].toUpperCase()}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium leading-tight'>
                        {report.reporterInfo?.fullName ?? report.reporterId.slice(0, 8)}
                      </p>
                      {report.details && (
                        <p className='mt-0.5 truncate text-xs text-muted-foreground'>{report.details}</p>
                      )}
                      <p className='mt-0.5 text-xs text-muted-foreground'>{formatDateTimeShort(report.createdAt)}</p>
                    </div>
                    <Badge variant='outline' className='shrink-0 text-xs'>
                      {text.reasonLabels[report.reason]}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Processing result (when already resolved/dismissed) */}
          {!isPending && processedReport?.adminAction && (
            <>
              <Separator />
              <div className='rounded-lg border bg-muted/20 p-3'>
                <p className='mb-2 text-sm font-semibold'>{text.processDialog.resultTitle}</p>
                <div className='text-sm'>
                  <span className='text-muted-foreground'>{text.processDialog.actionLabel}</span>
                  <Badge className='ml-2'>{text.actionLabels[processedReport.adminAction]}</Badge>
                </div>
                {processedReport.adminNote && (
                  <div className='mt-2 text-sm'>
                    <span className='text-muted-foreground'>{text.processDialog.adminNoteLabel}</span>
                    <p className='mt-1 rounded-md bg-background p-2'>{processedReport.adminNote}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action section (only when pending) */}
          {isPending && (
            <>
              <Separator />
              <div className='space-y-3'>
                <div>
                  <label className='mb-2 block text-sm font-medium'>{text.processDialog.actionRequiredLabel}</label>
                  <div className='grid gap-2 sm:grid-cols-2'>
                    {(Object.keys(text.actionLabels) as AdminAction[]).map((key) => {
                      const selected = action === key
                      return (
                        <button
                          key={key}
                          type='button'
                          onClick={() => setAction(key)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-left transition-all',
                            selected
                              ? `${actionStyles[key]} ring-2 ring-offset-1`
                              : 'hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          <p className='text-sm font-semibold'>{text.actionLabels[key]}</p>
                          <p className='mt-1 text-xs text-muted-foreground'>{text.actionDescriptions[key]}</p>
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
                    rows={3}
                    maxLength={300}
                  />
                  <p className='mt-1 text-right text-xs text-muted-foreground'>{adminNote.length}/300</p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
            {isPending ? text.processDialog.cancelButton : text.processDialog.closeButton}
          </Button>
          {isPending && (
            <Button
              onClick={handleSubmit}
              disabled={!action || mutation.isPending}
              className={cn(
                selectedActionStyle && selectedActionStyle,
                !selectedActionLabel && 'bg-primary text-primary-foreground'
              )}
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
