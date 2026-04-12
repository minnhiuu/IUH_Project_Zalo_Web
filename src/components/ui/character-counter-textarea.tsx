import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

export interface CharacterCounterTextareaProps extends React.ComponentProps<typeof Textarea> {
  maxLength: number
  showCounter?: boolean
  counterClassName?: string
  /**
   * Optional manual label for "characters". If not provided, uses i18n ("characters" from common namespace).
   */
  charactersLabel?: string
}

const CharacterCounterTextarea = React.forwardRef<HTMLTextAreaElement, CharacterCounterTextareaProps>(
  ({ maxLength, className, showCounter = true, counterClassName, charactersLabel, value, onChange, ...props }, ref) => {
    const { t } = useTranslation('common')
    const [uncontrolledValue, setUncontrolledValue] = React.useState('')
    const displayValue = value !== undefined ? value : uncontrolledValue
    const length = (displayValue?.toString() || '').length
    const label = charactersLabel ?? t('characters')

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= maxLength) {
        if (value === undefined) {
          setUncontrolledValue(e.target.value)
        }
        onChange?.(e)
      }
    }

    return (
      <div className='relative w-full group/counter'>
        <Textarea
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            'min-h-[100px] resize-none pr-3 transition-all duration-200 focus-visible:ring-primary/20 focus-visible:border-primary',
            showCounter && 'pb-8',
            className
          )}
          {...props}
        />
        {showCounter && (
          <div
            className={cn(
              'pointer-events-none absolute bottom-2.5 right-3 text-[11.5px] font-medium select-none transition-colors',
              length >= maxLength
                ? 'text-destructive'
                : 'text-muted-foreground/60 group-focus-within/counter:text-primary/70',
              counterClassName
            )}
          >
            {length}/{maxLength} {label}
          </div>
        )}
      </div>
    )
  }
)

CharacterCounterTextarea.displayName = 'CharacterCounterTextarea'

export { CharacterCounterTextarea }
