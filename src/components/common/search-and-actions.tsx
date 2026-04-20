import { Search, type LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchAction {
  icon: LucideIcon
  onClick: () => void
  title?: string
}

interface SearchAndActionsProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  placeholder?: string
  actions?: SearchAction[]
  className?: string
  inputClassName?: string
}

export function SearchAndActions({
  value,
  onChange,
  onFocus,
  placeholder,
  actions = [],
  className,
  inputClassName
}: SearchAndActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className='relative flex-1 group'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/60 group-focus-within:text-primary transition-colors' />
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className={cn(
            'pl-9 h-8 w-full bg-muted/60 border-none focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-text-secondary/60 text-sm rounded-md',
            inputClassName
          )}
        />
      </div>
      <div className='flex items-center gap-0.5 shrink-0'>
        {actions.map((action, index) => (
          <button
            key={index}
            className='p-1.5 hover:bg-muted rounded-md transition-colors shrink-0'
            onClick={(e) => {
              e.stopPropagation()
              action.onClick()
            }}
            title={action.title}
          >
            <action.icon className='w-[18px] h-[18px] text-text-primary/80' />
          </button>
        ))}
      </div>
    </div>
  )
}
