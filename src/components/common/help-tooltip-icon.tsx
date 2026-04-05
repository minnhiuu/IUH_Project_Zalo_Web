import { CircleHelp } from 'lucide-react'
import { CustomTooltip } from '@/components/common/custom-tooltip'
import { cn } from '@/lib/utils'

interface HelpTooltipIconProps {
  content: string
  className?: string
  iconClassName?: string
}

export function HelpTooltipIcon({ content, className, iconClassName }: HelpTooltipIconProps) {
  return (
    <CustomTooltip
      content={content}
      position='top'
      align='center'
      className={cn('inline-flex items-center', className)}
      tooltipClassName='max-w-52 text-[12.5px] leading-5'
    >
      <span className='inline-flex items-center justify-center cursor-help'>
        <CircleHelp className={cn('w-4 h-4 text-muted-foreground', iconClassName)} />
      </span>
    </CustomTooltip>
  )
}
