import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, BrainCircuit, Activity, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { StepOneParse } from './step-one-parse'
import { StepTwoChunking } from './step-two-chunking'
import { StepThreeStatus } from './step-three-status'
import { INITIAL_INGEST_STATE, type IngestState, type IngestStep } from '../schemas/ingest-document.schema'
import { useIngestText } from '../i18n/use-ingest-text'

export function IngestDocument() {
  const [state, setState] = useState<IngestState>(INITIAL_INGEST_STATE)
  const { text } = useIngestText()

  const updateState = useCallback((update: Partial<IngestState>) => {
    setState((prev) => ({ ...prev, ...update }))
  }, [])

  const handleNext = () => {
    if (state.step < 3) {
      updateState({ step: (state.step + 1) as IngestStep })
    }
  }

  const handleBack = () => {
    if (state.step > 1) {
      updateState({ step: (state.step - 1) as IngestStep })
    }
  }

  const STEPS = [
    { id: 1, label: text.page.steps.extract, icon: BrainCircuit },
    { id: 2, label: text.page.steps.chunk, icon: Activity },
    { id: 3, label: text.page.steps.store, icon: Database }
  ]

  return (
    <div className='flex flex-col gap-6 pb-10 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleBack}
            disabled={state.step === 1}
            className='h-10 w-10 rounded-lg bg-card border border-border hover:bg-muted'
          >
            <ChevronLeft size={18} className='text-muted-foreground' />
          </Button>
          <div className='flex flex-col gap-0.5'>
            <h1 className='text-3xl font-bold tracking-tight text-foreground uppercase'>{text.page.title}</h1>
            <p className='text-muted-foreground font-medium text-[14px] leading-tight'>
              {text.page.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div className='bg-muted p-1 h-auto rounded-lg flex items-center gap-1'>
          {STEPS.map((s) => (
            <button
              key={s.id}
              type='button'
              onClick={() => updateState({ step: s.id as IngestStep })}
              className={cn(
                'rounded-md px-4 py-2 h-9 text-[13px] font-bold transition-all flex items-center gap-2',
                state.step === s.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <s.icon size={14} />
              {s.label}
            </button>
          ))}
        </div>

        <Badge
          variant='outline'
          className='font-bold text-[10px] px-3 py-1 bg-dashboard-badge-bg text-muted-foreground border-border/60 rounded-lg uppercase'
        >
          {text.page.stepLabel(state.step, 3)}
        </Badge>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={state.step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {state.step === 1 && <StepOneParse state={state} onUpdate={updateState} onNext={handleNext} />}
          {state.step === 2 && <StepTwoChunking state={state} onUpdate={updateState} onNext={handleNext} />}
          {state.step === 3 && <StepThreeStatus state={state} onUpdate={updateState} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
