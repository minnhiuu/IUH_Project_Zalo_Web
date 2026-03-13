import { useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, Info, Rocket } from 'lucide-react'
import { ReindexTaskStatus } from '@/constants/enum'
import type { ReindexStatus } from '../schemas/elasticsearch.schema'
import { cn } from '@/lib/utils'

import { useElasticsearchText } from '../i18n/use-elasticsearch-text'

interface ReindexProgressBarProps {
  status: ReindexStatus | undefined
  onClose?: () => void
}

export const ReindexProgressBar = ({ status, onClose }: ReindexProgressBarProps) => {
  const { text } = useElasticsearchText()
  const isCompleted = status?.status === ReindexTaskStatus.Completed
  const isFailed = status?.status === ReindexTaskStatus.Failed
  const isRunning = status?.status === ReindexTaskStatus.Running

  useEffect(() => {
    if ((isCompleted || isFailed) && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, isFailed, onClose])

  if (!status) return null

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-none shadow-xl transition-all duration-500',
        'bg-white/70 backdrop-blur-xl dark:bg-slate-900/70',
        'animate-in slide-in-from-top-4 fade-in duration-500'
      )}
    >
      {isRunning && <div className='absolute inset-0 bg-brand-blue/5 animate-pulse pointer-events-none' />}

      <CardContent className='relative p-5'>
        <div className='flex items-start gap-4'>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors duration-500',
              isRunning && 'bg-brand-blue/10 text-brand-blue',
              isCompleted && 'bg-green-500/10 text-green-600',
              isFailed && 'bg-red-500/10 text-red-600'
            )}
          >
            {isRunning && <Rocket className='h-5 w-5 animate-bounce' style={{ animationDuration: '2s' }} />}
            {isCompleted && <CheckCircle2 className='h-5 w-5' />}
            {isFailed && <XCircle className='h-5 w-5' />}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <h3 className='text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight'>
                {isRunning
                  ? text.progressBar.titleRunning
                  : isCompleted
                    ? text.progressBar.titleCompleted
                    : text.progressBar.titleFailed}
              </h3>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
                  {status.processed} / {status.total}
                </span>
                <span className='text-sm font-black text-brand-blue tabular-nums'>{status.percentage}%</span>
              </div>
            </div>

            <Progress
              value={status.percentage}
              className={cn(
                'h-2 overflow-hidden bg-slate-100 dark:bg-slate-800 transition-all duration-500',
                isCompleted && 'shadow-[0_0_10px_rgba(34,197,94,0.3)]'
              )}
            />

            <div className='mt-3 flex items-center justify-between gap-4'>
              <div className='flex items-center gap-1.5 text-slate-500 dark:text-slate-400'>
                <Info className='h-3.5 w-3.5 shrink-0' />
                <p className='text-[12px] font-medium truncate leading-tight'>{status.message}</p>
              </div>

              {(isCompleted || isFailed) && (
                <button
                  onClick={onClose}
                  className='shrink-0 rounded-lg px-3 py-1 text-[11px] font-bold text-brand-blue hover:bg-brand-blue/5 transition-colors cursor-pointer ring-1 ring-brand-blue/20'
                >
                  {text.progressBar.close}
                </button>
              )}
            </div>
          </div>
        </div>

        {isRunning && (
          <div
            className='absolute bottom-0 left-0 h-0.5 bg-brand-blue animate-[progress_2s_ease-in-out_infinite]'
            style={{ width: '30%', filter: 'blur(1px)' }}
          />
        )}
      </CardContent>

      <style>{`
        @keyframes progress {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      `}</style>
    </Card>
  )
}
