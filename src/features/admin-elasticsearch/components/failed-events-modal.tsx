import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Info, Terminal, AlertCircle, Hash, RotateCcw } from 'lucide-react'
import type { FailedEvent } from '../schemas/elasticsearch.schema'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'
import { formatFullDateTime } from '@/utils/date'
import { PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FailedEventDetailModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  eventId: string | null
  events: FailedEvent[] | undefined
  onRetry?: (id: string) => void
  onMarkResolved?: (id: string, resolved: boolean) => void
  isRetrying?: boolean
  isUpdating?: boolean
}

export function FailedEventDetailModal({
  isOpen,
  onOpenChange,
  eventId,
  events,
  onRetry,
  onMarkResolved,
  isRetrying,
  isUpdating
}: FailedEventDetailModalProps) {
  const { text } = useElasticsearchText()
  const selectedEvent = events?.find((e) => e.id === eventId)

  if (!selectedEvent) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white dark:bg-slate-900'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50 dark:bg-slate-800/30'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <DialogTitle className='text-2xl font-black uppercase text-[#1a365d] dark:text-blue-400 tracking-tight whitespace-nowrap'>
                {text.dlq.modal.title}
              </DialogTitle>
              <DialogDescription className='text-sm font-medium text-gray-500 dark:text-slate-400'>
                {text.dlq.modal.subtitle}
              </DialogDescription>
            </div>
            {selectedEvent.resolved ? (
              <div className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase border border-emerald-200/50'>
                {text.dlq.status.processed}
              </div>
            ) : (
              <div className='bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase border border-red-200/50'>
                {text.dlq.status.unprocessed}
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh]'>
          <div className='p-8 pt-4 space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='flex items-start gap-4'>
                  <div className='h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0'>
                    <Info className='h-5 w-5 text-blue-600' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-500 font-medium'>Event ID</p>
                    <p className='text-md font-bold text-gray-900 dark:text-gray-100 break-all'>
                      {selectedEvent.eventId}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0'>
                    <Terminal className='h-5 w-5 text-purple-600' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-500 font-medium'>{text.dlq.table.eventType}</p>
                    <div className='font-bold text-gray-900 dark:text-gray-100'>{selectedEvent.eventType}</div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-start gap-4'>
                  <div className='h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0'>
                    <Calendar className='h-5 w-5 text-green-600' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-500 font-medium'>{text.dlq.table.updatedAt}</p>
                    <div className='font-bold text-gray-900 dark:text-gray-100'>
                      {formatFullDateTime(selectedEvent.createdAt)}
                    </div>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0'>
                    <Hash className='h-5 w-5 text-orange-600' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-500 font-medium'>Topic / Partition / Offset</p>
                    <div className='font-bold text-gray-900 dark:text-gray-100'>
                      {selectedEvent.topic} [P:{selectedEvent.partition} @ {selectedEvent.offset}]
                    </div>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0'>
                    <RotateCcw className='h-5 w-5 text-orange-600' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-500 font-medium'>{text.dlq.modal.retryCount}</p>
                    <div className='font-bold text-gray-900 dark:text-gray-100'>
                      {selectedEvent.retryCount || 0} {text.dlq.modal.retryUnit}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='h-px bg-gray-100 dark:bg-slate-800' />

            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold'>
                <AlertCircle className='h-4 w-4 text-red-500' />
                <span>{text.dlq.modal.errorTitle}</span>
              </div>
              <div className='p-4 rounded-xl bg-red-50/30 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30'>
                <code className='text-[13px] font-medium text-red-700 dark:text-red-400 leading-relaxed block font-mono break-all'>
                  {selectedEvent.errorMessage || text.dlq.modal.noErrorMessage}
                </code>
              </div>
            </div>

            {selectedEvent.stackTrace && (
              <>
                <div className='h-px bg-gray-100 dark:bg-slate-800' />
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold'>
                    <Terminal className='h-4 w-4 text-red-500' />
                    <span>Stack Trace</span>
                  </div>
                  <ScrollArea className='h-[300px] rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/10'>
                    <pre className='p-4 text-[11px] font-mono text-red-700/80 dark:text-red-400/80 leading-relaxed break-all whitespace-pre-wrap'>
                      {selectedEvent.stackTrace}
                    </pre>
                  </ScrollArea>
                </div>
              </>
            )}

            <div className='h-px bg-gray-100 dark:bg-slate-800' />

            {selectedEvent.payload && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold'>
                  <Info className='h-4 w-4 text-blue-500' />
                  <span>{text.dlq.modal.jsonTitle}</span>
                </div>
                <ScrollArea className='h-[200px] rounded-xl border border-gray-200 dark:border-slate-700'>
                  <pre className='p-4 text-[12px] font-mono text-gray-700 dark:text-gray-300 leading-relaxed'>
                    {JSON.stringify(JSON.parse(selectedEvent.payload), null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            <div className='h-px bg-gray-100 dark:bg-slate-800' />

            <div className='flex flex-wrap items-center gap-3 pt-2'>
              {!selectedEvent.resolved ? (
                <>
                  <Button
                    onClick={() => onRetry?.(selectedEvent.id)}
                    disabled={isRetrying}
                    className='flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold transition-all text-white gap-2'
                  >
                    <RotateCcw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
                    {text.dlq.actions.retrySingle}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => onMarkResolved?.(selectedEvent.id, true)}
                    disabled={isUpdating}
                    className='flex-1 h-12 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-bold gap-2'
                  >
                    <PlayCircle className={cn('h-4 w-4', isUpdating && 'animate-spin')} />
                    {text.dlq.actions.markResolved}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => onMarkResolved?.(selectedEvent.id, false)}
                  disabled={isUpdating}
                  className='flex-1 h-12 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 font-bold transition-all gap-2 border border-red-200'
                >
                  <AlertCircle className={cn('h-4 w-4', isUpdating && 'animate-spin')} />
                  {text.dlq.actions.markUnprocessed}
                </Button>
              )}
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='w-full md:w-auto h-12 px-8 rounded-xl border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium'
              >
                {text.dlq.modal.close}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
