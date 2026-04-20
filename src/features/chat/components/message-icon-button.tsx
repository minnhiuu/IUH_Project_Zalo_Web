import React from 'react'
import { cn } from '@/lib/utils'

interface MessageIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  iconSize?: 'sm' | 'md'
}

export function MessageIconButton({ icon, iconSize = 'md', className, ...props }: MessageIconButtonProps) {
  return (
    <button
      type='button'
      className={cn(
        'h-6 w-6 rounded-full border border-border/70 bg-background/95 text-icon-secondary shadow-sm',
        'flex items-center justify-center transition-colors cursor-pointer shrink-0',
        iconSize === 'sm' ? '[&>svg]:w-3 [&>svg]:h-3' : '[&>svg]:w-3.5 [&>svg]:h-3.5',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
