import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AuthButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean
  loadingText?: string
}

export function AuthButton({ children, className, isLoading, loadingText, disabled, ...props }: AuthButtonProps) {
  return (
    <Button
      type='submit'
      variant='vibrant'
      disabled={disabled || isLoading}
      className={cn(
        'w-full font-bold text-[16px] transition-all shadow-none border-none rounded-[4px] h-[48px]',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? loadingText || children : children}
    </Button>
  )
}
