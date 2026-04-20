import { ArrowRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIngestText } from '../../i18n/use-ingest-text'

interface StepThreeActionsProps {
  onGoDashboard: () => void
}

export function StepThreeActions({ onGoDashboard }: StepThreeActionsProps) {
  const { text } = useIngestText()

  return (
    <div className='flex flex-wrap justify-end gap-3'>
      <Button
        variant='outline'
        className='h-10 px-4 rounded-lg border-border bg-transparent text-foreground font-bold text-xs uppercase tracking-widest hover:bg-muted'
      >
        <Download className='mr-2 w-4 h-4' /> {text.stepThree.actions.download}
      </Button>

      <Button
        className='h-10 px-5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm'
        onClick={onGoDashboard}
      >
        {text.stepThree.actions.backDashboard} <ArrowRight className='ml-2 w-4 h-4' />
      </Button>
    </div>
  )
}
