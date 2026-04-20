import { Terminal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useIngestText } from '../../i18n/use-ingest-text'

interface StepThreeTerminalViewProps {
  terminalLines: string[]
}

export function StepThreeTerminalView({ terminalLines }: StepThreeTerminalViewProps) {
  const { text } = useIngestText()

  return (
    <div className='bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm overflow-hidden flex flex-col'>
      <div className='px-6 py-3 border-b border-section-divider bg-dashboard-card-header-bg flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Terminal size={15} className='text-brand-blue' />
          <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight'>
            {text.stepThree.terminal.title}
          </h3>
        </div>
        <Badge
          variant='outline'
          className='font-bold text-[10px] px-3 py-1 bg-dashboard-badge-bg text-muted-foreground border-border/60 rounded-lg shrink-0'
        >
          {text.stepThree.terminal.logCount(terminalLines.length)}
        </Badge>
      </div>

      <div className='flex-1 p-4 bg-[#0B1220] overflow-y-auto'>
        <div className='font-mono text-[12px] leading-6 text-slate-300 space-y-1'>
          {terminalLines.map((line, index) => (
            <p key={`${line}-${index}`} className='whitespace-pre-wrap wrap-break-word'>
              <span className='text-brand-blue'>{'>'}</span> {line}
            </p>
          ))}
          {terminalLines.length === 0 ? <p className='text-slate-400'>{text.stepThree.terminal.waiting}</p> : null}
        </div>
      </div>
    </div>
  )
}
