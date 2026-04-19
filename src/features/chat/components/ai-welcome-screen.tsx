import { cn } from '@/lib/utils'
import { useChatText } from '../i18n/use-chat-text'

export function AiWelcomeScreen({ avatarUrl, onSelect }: { avatarUrl?: string; onSelect: (text: string) => void }) {
  const { text } = useChatText()
  const welcomeSuggestions = [
    { id: 'profile', emoji: '👤', text: text.aiWindow.suggestions.profile },
    { id: 'friends', emoji: '👥', text: text.aiWindow.suggestions.friends },
    { id: 'internet', emoji: '🌐', text: text.aiWindow.suggestions.internet }
  ]

  return (
    <div className='flex flex-col items-center justify-center flex-1 px-6 py-10 text-center'>
      <div className='w-16 h-16 mb-4'>
        <img
          src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001`}
          alt={text.aiWindow.title}
          className='w-full h-full rounded-full object-cover shadow-lg border border-black/5'
        />
      </div>
      <h2 className='text-xl font-bold text-foreground mb-2'>{text.aiWindow.title}</h2>
      <p className='text-muted-foreground text-sm max-w-xs mb-6'>
        {text.aiWindow.welcomeDescription}
      </p>
      <div className='flex flex-col gap-2 w-full max-w-sm'>
        {welcomeSuggestions.map(({ id, emoji, text: suggestionText }) => (
          <button
            key={id}
            onClick={() => onSelect(suggestionText)}
            className={cn(
              'flex items-center gap-2.5 text-left px-4 py-2.5 rounded-xl border transition-all',
              'border-blue-200 dark:border-blue-800',
              'bg-blue-50/60 dark:bg-blue-950/40',
              'text-blue-800 dark:text-blue-200 text-sm font-medium',
              'hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-400 hover:shadow-sm',
              'cursor-pointer active:scale-[0.98]'
            )}
          >
            <span className='text-base'>{emoji}</span>
            {suggestionText}
          </button>
        ))}
      </div>
    </div>
  )
}
