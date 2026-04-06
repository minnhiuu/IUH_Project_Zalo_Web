import { useChatText } from '../i18n/use-chat-text'
import type { AiProcessingStatus } from '@/constants/enum'

export function AiStatusBar({ statusEnum }: { statusEnum?: AiProcessingStatus }) {
  const { text } = useChatText()
  const label = text.aiStatusLabel(statusEnum)
  return (
    <div className='flex items-center gap-1.5 px-4 py-1 text-[11px] text-blue-500 dark:text-blue-400 italic select-none'>
      <span className='flex items-center gap-[3px]'>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className='w-[5px] h-[5px] rounded-full bg-blue-400 animate-bounce'
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
      <span>{label}</span>
    </div>
  )
}
