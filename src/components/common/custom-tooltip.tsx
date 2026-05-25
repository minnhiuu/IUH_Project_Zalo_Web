import React from 'react'
import { cn } from '@/lib/utils'

interface CustomTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  tooltipClassName?: string
  position?: 'top' | 'bottom'
  align?: 'left' | 'center' | 'right'
}

export function CustomTooltip({
  children,
  content,
  className,
  tooltipClassName,
  position = 'top',
  align = 'center'
}: CustomTooltipProps) {
  const getAlignClasses = () => {
    switch (align) {
      case 'left':
        return 'left-0'
      case 'right':
        return 'right-0'
      case 'center':
      default:
        return 'left-1/2 -translate-x-1/2'
    }
  }

  const getArrowClasses = () => {
    switch (align) {
      case 'left':
        return 'left-1'
      case 'right':
        return 'right-1'
      case 'center':
      default:
        return 'left-1/2 -translate-x-1/2'
    }
  }

  return (
    <div className={cn('relative group/tooltip inline-block', className)}>
      {children}
      <div
        className={cn(
          'absolute px-3 py-1.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[13px] font-semibold rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-100 shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-zinc-100 dark:border-zinc-700 scale-95 group-hover/tooltip:scale-100 w-max max-w-[250px] text-center',
          position === 'top' ? 'bottom-full mb-3' : 'top-full mt-3',
          getAlignClasses(),
          tooltipClassName
        )}
      >
        {content}
        <div
          className={cn(
            'absolute border-[6px] border-transparent',
            getArrowClasses(),
            position === 'top' ? 'top-full border-t-white dark:border-t-zinc-800' : 'bottom-full border-b-white dark:border-b-zinc-800'
          )}
        />
        {/* Subtle border for the arrow */}
        <div
          className={cn(
            'absolute border-[7px] border-transparent -z-10',
            getArrowClasses(),
            position === 'top' ? 'top-full border-t-zinc-100 dark:border-t-zinc-700' : 'bottom-full border-b-zinc-100 dark:border-b-zinc-700'
          )}
        />
      </div>
    </div>
  )
}
