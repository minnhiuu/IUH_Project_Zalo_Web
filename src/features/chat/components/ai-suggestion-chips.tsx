import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AiSuggestionChips({
  suggestions,
  onSelect,
  disabled
}: {
  suggestions: string[]
  onSelect: (text: string) => void
  disabled: boolean
}) {
  if (!suggestions.length) return null
  return (
    <div className='flex flex-wrap gap-1.5 mt-2 px-1'>
      {suggestions.map((s) => (
        <button
          key={s}
          disabled={disabled}
          onClick={() => onSelect(s)}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
            'bg-blue-50 border-blue-200 text-blue-700',
            'dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300',
            'hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-400 hover:shadow-sm',
            'cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
            'active:scale-95'
          )}
        >
          <Sparkles size={11} className='shrink-0' />
          {s}
        </button>
      ))}
    </div>
  )
}
