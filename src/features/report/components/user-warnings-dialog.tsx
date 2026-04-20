import { AlertTriangle, CalendarClock, ShieldAlert } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserWarnings } from '@/features/report/queries/report-queries'
import { useReportAdminText } from '@/features/report/i18n/use-report-admin-text'
import { cn } from '@/lib/utils'
import { formatDateTimeShort } from '@/utils/date'
import type { ReportReason } from '@/features/report/schemas/report.schema'

type UserWarningsDialogProps = {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function UserWarningsDialog({ userId, open, onOpenChange }: UserWarningsDialogProps) {
  const { text } = useReportAdminText()
  const { data, isLoading } = useUserWarnings(userId ?? '')

  const warnings = data?.data?.data ?? []
  const latestWarningAt = warnings.reduce<string | undefined>((latest, warning) => {
    if (!latest) return warning.createdAt
    return new Date(warning.createdAt).getTime() > new Date(latest).getTime() ? warning.createdAt : latest
  }, undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ShieldAlert className='h-5 w-5 text-amber-600' /> {text.warningsDialog.title}
          </DialogTitle>
          <DialogDescription>{text.warningsDialog.user(userId?.slice(0, 8) ?? '')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          {!isLoading && (
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='rounded-lg border bg-muted/20 p-3'>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                  {text.warningsDialog.totalWarnings}
                </p>
                <p className='mt-1 text-2xl font-bold'>{warnings.length}</p>
              </div>
              <div className='rounded-lg border bg-muted/20 p-3'>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>{text.warningsDialog.latest}</p>
                <p className='mt-1 flex items-center gap-1 text-sm font-medium'>
                  <CalendarClock className='h-4 w-4 text-muted-foreground' />
                  {latestWarningAt ? formatDateTimeShort(latestWarningAt) : text.warningsDialog.noneYet}
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-20 w-full rounded-md' />
              ))}
            </div>
          )}

          {!isLoading && warnings.length === 0 && (
            <div className='rounded-lg border border-dashed bg-muted/20 py-8 text-center'>
              <div className='mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted'>
                <AlertTriangle className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground'>{text.warningsDialog.empty}</p>
            </div>
          )}

          {warnings.map((warning, idx) => (
            <div key={warning.id} className='space-y-2 rounded-lg border p-3'>
              <div className='flex items-center justify-between gap-2'>
                <Badge variant='outline' className={cn('text-xs', reasonClasses[warning.reason])}>
                  {text.reasonLabels[warning.reason]}
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  {text.warningsDialog.warningIndex(idx + 1, formatDateTimeShort(warning.createdAt))}
                </span>
              </div>

              {warning.adminNote && <p className='text-sm text-muted-foreground'>{warning.adminNote}</p>}

              <p className='text-xs text-muted-foreground'>
                {text.warningsDialog.reportCode(warning.reportId.slice(0, 8))}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
