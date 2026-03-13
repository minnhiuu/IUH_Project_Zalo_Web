import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ActionRowProps {
  title: string
  description?: string
  children?: ReactNode
  mode?: 'section' | 'inline'
  action?: ReactNode
  className?: string
  contentClassName?: string
  titleClassName?: string
}

export function ActionRow({
  title,
  description,
  children,
  mode = 'section',
  action,
  className,
  contentClassName,
  titleClassName
}: ActionRowProps) {
  const baseTitleClass =
    mode === 'inline' ? 'text-sm font-medium text-foreground' : 'text-base font-medium text-foreground'

  if (mode === 'inline') {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4',
          contentClassName
        )}
      >
        <div>
          <h3 className={cn(baseTitleClass, titleClassName)}>{title}</h3>
          {description && <p className='text-xs text-muted-foreground'>{description}</p>}
        </div>
        {action ?? children}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className={cn(baseTitleClass, titleClassName)}>{title}</h3>
      <div className={cn('rounded-lg border border-border bg-card p-4 space-y-2', contentClassName)}>
        {description && <p className='text-xs text-muted-foreground'>{description}</p>}
        {children}
      </div>
    </div>
  )
}
