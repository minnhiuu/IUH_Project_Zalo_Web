import { useState } from 'react'
import { BaseDialog } from '@/components/common/base-dialog'
import { cn } from '@/lib/utils'

interface DisappearingMessagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (duration: string) => void
  currentDuration?: string
}

const OPTIONS = [
  { value: '1 day', label: '1 day' },
  { value: '7 days', label: '7 days' },
  { value: '14 days', label: '14 days' },
  { value: 'never', label: 'Never' }
]

export function DisappearingMessagesDialog({
  open,
  onOpenChange,
  onConfirm,
  currentDuration = 'never'
}: DisappearingMessagesDialogProps) {
  const [selected, setSelected] = useState(currentDuration)

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Set disappearing time for messages'
      confirmText='Confirm'
      cancelText='Cancel'
      onConfirm={() => onConfirm(selected)}
      className='w-[400px]'
    >
      <div className='flex flex-col gap-4 py-4 px-6'>
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className='flex items-center gap-3 cursor-pointer group'
          >
            <div className='relative flex items-center justify-center'>
              <input
                type='radio'
                name='duration'
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
                className='peer sr-only'
              />
              <div className='w-4 h-4 border border-muted-foreground/50 rounded-full transition-colors peer-checked:border-primary peer-checked:border-[5px]' />
            </div>
            <span className={cn(
              'text-[15px] transition-colors',
              selected === option.value ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </BaseDialog>
  )
}
