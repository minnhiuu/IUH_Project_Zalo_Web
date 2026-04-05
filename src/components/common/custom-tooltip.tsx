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
      case 'left': return 'left-0'
      case 'right': return 'right-0'
      case 'center':
      default: return 'left-1/2 -translate-x-1/2'
    }
  }

  const getArrowClasses = () => {
    switch (align) {
      case 'left': return 'left-1'
      case 'right': return 'right-1'
      case 'center':
      default: return 'left-1/2 -translate-x-1/2'
    }
  }

  return (
    <div className={cn('relative group/tooltip inline-block', className)}>
      {children}
      <div
        className={cn(
          'absolute px-4 py-2 bg-brand-blue-dark text-white text-[13px] font-medium rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-100 shadow-xl scale-95 group-hover/tooltip:scale-100 w-max max-w-[250px]',
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
            position === 'top' 
              ? 'top-full border-t-brand-blue-dark' 
              : 'bottom-full border-b-brand-blue-dark'
          )}
        />
      </div>
    </div>
  )
}
