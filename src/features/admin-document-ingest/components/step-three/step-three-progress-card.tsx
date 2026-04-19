import { CheckCircle2, Database, Loader2, ShieldCheck, Activity, Globe } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useIngestText } from '../../i18n/use-ingest-text'

interface StepThreeProgressCardProps {
  ingestStatus: 'vectorizing' | 'finalizing' | 'success' | 'failed'
  statusLabel: string
  progress: number
  uploadedChunks: number
  totalChunks: number
  activeChunksLength: number
  currentVectorId: string | null
}

export function StepThreeProgressCard({
  ingestStatus,
  statusLabel,
  progress,
  uploadedChunks,
  totalChunks,
  activeChunksLength,
  currentVectorId
}: StepThreeProgressCardProps) {
  const { text } = useIngestText()

  return (
    <div className='bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm overflow-hidden'>
      <div className='px-6 py-3 border-b border-section-divider bg-dashboard-card-header-bg flex items-center justify-between'>
        <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight'>{text.stepThree.progress.title}</h3>
        <Badge
          variant='outline'
          className={cn(
            'font-bold text-[10px] px-3 py-1 rounded-lg uppercase tracking-wide border',
            ingestStatus === 'success'
              ? 'bg-success-bg text-success-text border-success-border'
              : ingestStatus === 'failed'
                ? 'bg-destructive-subtle text-destructive-text border-destructive-border'
                : 'bg-dashboard-badge-bg text-muted-foreground border-border/60'
          )}
        >
          {statusLabel}
        </Badge>
      </div>

      <div className='p-6 space-y-6'>
        <div className='flex items-start gap-4'>
          <div
            className={cn(
              'h-14 w-14 rounded-xl border flex items-center justify-center shrink-0',
              ingestStatus === 'success'
                ? 'bg-success-bg border-success-border text-success-text'
                : ingestStatus === 'failed'
                  ? 'bg-destructive-subtle border-destructive-border text-destructive-text'
                  : 'bg-dashboard-icon-bg border-brand-blue-hover/30 text-brand-blue'
            )}
          >
            {ingestStatus === 'success' ? (
              <CheckCircle2 size={26} strokeWidth={2.2} />
            ) : (
              <div className='relative flex items-center justify-center'>
                <Database size={24} strokeWidth={2.2} />
                <Loader2 size={12} className='absolute -top-2.5 -right-2 animate-spin' />
              </div>
            )}
          </div>

          <div className='space-y-1'>
            <h2 className='text-2xl font-bold tracking-tight text-foreground uppercase'>
              {ingestStatus === 'success' ? text.stepThree.progress.readyTitle : text.stepThree.progress.ingestingTitle}
            </h2>
            <p className='text-muted-foreground font-medium leading-relaxed'>
              {ingestStatus === 'success'
                ? text.stepThree.progress.readyDesc
                : text.stepThree.progress.ingestingDesc}
            </p>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
              {text.stepThree.progress.syncProgress}
            </span>
            <span className='text-sm font-bold text-brand-blue'>{Math.min(progress, 100)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} className='h-2.5 bg-muted' />
          <p className='text-xs text-muted-foreground font-medium'>
            {currentVectorId
              ? text.stepThree.progress.uploadedSummaryWithCurrent(
                  uploadedChunks,
                  Math.max(totalChunks, activeChunksLength),
                  currentVectorId
                )
              : text.stepThree.progress.uploadedSummary(uploadedChunks, Math.max(totalChunks, activeChunksLength))}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          {[
            {
              icon: ShieldCheck,
              label: text.stepThree.progress.stats.securityLabel,
              val: text.stepThree.progress.stats.securityValue,
              color: 'text-brand-blue'
            },
            {
              icon: Activity,
              label: text.stepThree.progress.stats.performanceLabel,
              val: text.stepThree.progress.stats.performanceValue,
              color: 'text-success-text'
            },
            {
              icon: Globe,
              label: text.stepThree.progress.stats.cdnLabel,
              val: text.stepThree.progress.stats.cdnValue,
              color: 'text-primary'
            }
          ].map((stat, i) => (
            <div
              key={i}
              className='flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-dashboard-card-header-bg'
            >
              <div className='h-8 w-8 rounded-lg bg-dashboard-icon-bg border border-border/40 flex items-center justify-center'>
                <stat.icon size={15} className={stat.color} />
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                  {stat.label}
                </span>
                <span className='text-sm font-bold text-foreground'>{stat.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
