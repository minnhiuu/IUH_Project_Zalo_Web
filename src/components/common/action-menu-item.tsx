import React from 'react'
import { cn } from '@/lib/utils'

interface ActionMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  labelRightElement?: React.ReactNode
  subLabel?: string
  rightElement?: React.ReactNode
  as?: 'button' | 'div'
  variant?: 'default' | 'destructive'
  showDivider?: boolean
  disabled?: boolean
}

export function ActionMenuItem({
  icon,
  label,
  labelRightElement,
  subLabel,
  rightElement,
  as = 'button',
  variant = 'default',
  showDivider = false,
  className,
  disabled = false,
  ...props
}: ActionMenuItemProps) {
  const itemClassName = cn(
    'flex w-full items-center gap-3 px-4 py-2.5 text-[0.875rem] transition-all group text-left',
    as === 'button' && 'cursor-pointer hover:bg-muted/50',
    variant === 'default' ? 'text-foreground' : 'text-destructive-subtle-text',
    className
  )

  const content = (
    <>
      <span
        className={cn(
          'shrink-0 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.8] transition-opacity group-hover:opacity-80',
          variant === 'default' ? 'text-icon-menu' : 'text-destructive-subtle-text'
        )}
      >
        {icon}
      </span>
      <div className='flex-1 min-w-0 flex flex-col'>
        <div className='flex items-center gap-1.5'>
          <span className={cn('truncate', variant === 'default' ? 'text-foreground' : 'text-destructive-subtle-text')}>
            {label}
          </span>
          {labelRightElement}
        </div>
        {subLabel && (
          <span className='text-[11px] text-muted-foreground truncate leading-tight mt-0.5'>{subLabel}</span>
        )}
      </div>
      {rightElement && (
        <div className='shrink-0 flex items-center justify-center text-icon-secondary'>{rightElement}</div>
      )}
    </>
  )

  return (
    <div className={cn('w-full', disabled && 'opacity-50 pointer-events-none')}>
      {showDivider && <div className='ml-12 mr-4 h-px bg-border/40' />}
      {as === 'button' ? (
        <button type='button' disabled={disabled} className={itemClassName} {...props}>
          {content}
        </button>
      ) : (
        <div className={itemClassName}>{content}</div>
      )}
    </div>
  )
}
