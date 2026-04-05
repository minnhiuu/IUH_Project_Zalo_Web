import React from 'react'
import { cn } from '@/lib/utils'

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  iconSize?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'destructive'
}

export function ActionButton({
  icon,
  size = 'md',
  iconSize = 'md',
  variant = 'default',
  className,
  ...props
}: ActionButtonProps) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const iconSizeClasses = {
    sm: '[&>svg]:w-3.5 [&>svg]:h-3.5',
    md: '[&>svg]:w-4 [&>svg]:h-4',
    lg: '[&>svg]:w-5 [&>svg]:h-5'
  }

  return (
    <button
      type='button'
      className={cn(
        'flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 [&>svg]:stroke-[1.5]',
        'bg-[#e5e7eb] hover:bg-[#afb5c1] text-icon-menu',
        'dark:bg-[#2c323a] dark:hover:bg-[#1d2025]',
        variant === 'destructive' && 'text-destructive hover:bg-destructive/10',
        sizeClasses[size],
        iconSizeClasses[iconSize],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
