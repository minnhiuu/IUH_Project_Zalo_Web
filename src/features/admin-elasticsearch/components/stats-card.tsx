import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatsCardProps {
  title: string
  value: string | number
  subValue?: string
  icon: React.ElementType
  growth?: number
  isUp?: boolean
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive'
  loading?: boolean
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  growth,
  isUp,
  color = 'primary',
  loading
}) => {
  const colorMap = {
    primary: 'bg-primary',
    success: 'bg-success-solid',
    warning: 'bg-warning-text',
    info: 'bg-primary',
    destructive: 'bg-destructive-solid'
  }

  const iconColorMap = {
    primary: 'text-primary',
    success: 'text-success-solid',
    warning: 'text-warning-text',
    info: 'text-primary',
    destructive: 'text-destructive-solid'
  }

  return (
    <Card className='group relative overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md rounded-[1rem]'>
      <div className={cn('absolute top-0 left-0 h-1.5 w-full', colorMap[color])} />
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <p className='text-[14px] font-semibold text-dashboard-card-title'>{title}</p>
          <div className={cn('transition-colors', iconColorMap[color])}>
            <Icon className='h-5 w-5 stroke-2' />
          </div>
        </div>

        <div className='mt-1'>
          <h3 className='text-2xl font-bold tracking-tight text-foreground'>{loading ? '...' : value}</h3>
          <div className='mt-1 flex flex-col gap-0.5'>
            {growth !== undefined && growth !== null && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-[12px] font-bold',
                  isUp ? 'text-success-text' : 'text-destructive-text'
                )}
              >
                {isUp ? '↑' : '↓'} {Math.abs(growth)}%
              </div>
            )}
            {subValue && <p className='text-[11px] font-semibold text-muted-foreground leading-tight'>{subValue}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
