import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { FieldError as HookFieldError } from 'react-hook-form'

interface AuthInputProps extends React.ComponentProps<typeof Input> {
  icon: LucideIcon
  error?: HookFieldError
  containerClassName?: string
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon: Icon, error, className, containerClassName, ...props }, ref) => {
    return (
      <Field>
        <div
          className={cn(
            'group flex items-center border-b border-gray-200 pb-2 focus-within:border-primary transition-all duration-200',
            error && 'border-destructive focus-within:border-destructive',
            containerClassName
          )}
        >
          <Icon
            className='mr-3 h-5 w-5 text-muted-foreground/70 group-focus-within:text-primary transition-colors'
            strokeWidth={1.5}
          />
          <Input
            ref={ref}
            spellCheck={false}
            className={cn(
              'h-auto w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 font-normal outline-none text-foreground selection:bg-primary/20 rounded-none border-0 ring-0',
              className
            )}
            {...props}
          />
        </div>
        <FieldError errors={[error]} />
      </Field>
    )
  }
)

AuthInput.displayName = 'AuthInput'
