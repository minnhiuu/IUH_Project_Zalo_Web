import { Globe2, Users, Lock, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../i18n/use-social-text'

// ─── Types ────────────────────────────────────────────────────────────────────

export type VisibilityType = 'ALL' | 'FRIEND' | 'ONLY_ME'

export interface VisibilityOption {
  value: VisibilityType
  label: string
  icon: React.ElementType
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VisibilityDropdownProps {
  value: VisibilityType
  onChange: (value: VisibilityType) => void
  /** Alignment of the dropdown content relative to the trigger. Default: 'end' */
  align?: 'start' | 'end' | 'center'
  /** Show the icon of the current selection in the trigger button. Default: false */
  showIcon?: boolean
  /** Additional className for the trigger button */
  triggerClassName?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VisibilityDropdown({
  value,
  onChange,
  align = 'end',
  showIcon = false,
  triggerClassName
}: VisibilityDropdownProps) {
  const { text } = useSocialText()

  const options: VisibilityOption[] = [
    { value: 'ALL', label: text.post.visibility.Public, icon: Globe2 },
    { value: 'FRIEND', label: text.post.visibility.Friends, icon: Users },
    { value: 'ONLY_ME', label: text.post.visibility.Private, icon: Lock }
  ]

  const current = options.find((o) => o.value === value) ?? options[0]
  const Icon = current.icon

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'h-7 rounded-lg border border-border bg-muted/50 px-2.5 text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground',
            triggerClassName
          )}
        >
          {showIcon && <Icon className='h-3.5 w-3.5 mr-1' />}
          {current.label}
          <ChevronDown className='ml-1 h-3 w-3 opacity-50' />
        </Button>
      </DropdownMenuTrigger>

      {/* z-[9999] ensures the content renders above DialogContent (z-[110] in StoryComposerModal) */}
      <DropdownMenuContent align={align} className='w-40 z-[9999]'>
        {options.map((opt) => {
          const OptIcon = opt.icon
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => onChange(opt.value)}
              className='cursor-pointer gap-2 text-[13px]'
            >
              <OptIcon className='h-4 w-4 text-muted-foreground' />
              {opt.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
