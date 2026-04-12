import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface CharacterCounterInputProps extends React.ComponentProps<typeof Input> {
  maxLength: number
  showCounter?: boolean
  counterClassName?: string
}

const CharacterCounterInput = React.forwardRef<HTMLInputElement, CharacterCounterInputProps>(
  ({ maxLength, className, showCounter = true, counterClassName, value, onChange, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState('')
    const displayValue = value !== undefined ? value : uncontrolledValue
    const length = (displayValue?.toString() || '').length

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Direct blocking of input change
      if (e.target.value.length <= maxLength) {
        if (value === undefined) {
          setUncontrolledValue(e.target.value)
        }
        onChange?.(e)
      }
    }

    return (
      <div className='relative w-full group/counter'>
        <Input
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            'pr-16 transition-all duration-200 focus-visible:ring-primary/20 focus-visible:border-primary',
            className
          )}
          {...props}
        />
        {showCounter && (
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-medium select-none transition-colors border-l pl-3 my-2 border-border/50 group-focus-within/counter:border-primary/30',
              length >= maxLength
                ? 'text-destructive'
                : 'text-muted-foreground/60 group-focus-within/counter:text-primary/70',
              counterClassName
            )}
          >
            {length}/{maxLength}
          </div>
        )}
      </div>
    )
  }
)

CharacterCounterInput.displayName = 'CharacterCounterInput'

export { CharacterCounterInput }
