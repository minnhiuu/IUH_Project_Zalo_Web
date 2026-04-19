import { ChevronRight, FileUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIngestText } from '../../i18n/use-ingest-text'

interface StepOneRawContentPanelProps {
  isParsing: boolean
  rawContent: string
  onNext: () => void
}

export function StepOneRawContentPanel({ isParsing, rawContent, onNext }: StepOneRawContentPanelProps) {
  const { text } = useIngestText()

  return (
    <div className='bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm flex flex-col overflow-hidden'>
      <div className='h-12 border-b border-section-divider px-6 flex items-center justify-between shrink-0 bg-dashboard-card-header-bg'>
        <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
          {text.stepOne.raw.title}
        </span>
        {isParsing && <Loader2 className='w-3.5 h-3.5 text-brand-blue animate-spin' />}
      </div>

      <div className='flex-1 p-6 overflow-y-auto bg-muted/20 font-mono text-[12px] leading-6 text-foreground'>
        {isParsing ? (
          <div className='h-full flex flex-col items-center justify-center opacity-70'>
            <div className='w-10 h-10 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4' />
            <p className='uppercase tracking-[0.2em] font-bold text-muted-foreground'>{text.stepOne.raw.parsing}</p>
          </div>
        ) : rawContent ? (
          <div className='animate-in fade-in duration-500'>{rawContent}</div>
        ) : (
          <div className='h-full flex flex-col items-center justify-center opacity-40 text-center px-6 text-muted-foreground'>
            <FileUp size={32} className='mb-4' />
            <p className='uppercase tracking-[0.2em] font-bold'>{text.stepOne.raw.selectPrompt}</p>
          </div>
        )}
      </div>

      {rawContent && (
        <div className='p-4 border-t border-section-divider bg-dashboard-card-header-bg'>
          <Button
            onClick={onNext}
            className='w-full h-10 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all'
          >
            {text.stepOne.raw.nextStep} <ChevronRight size={16} className='ml-1' />
          </Button>
        </div>
      )}
    </div>
  )
}
