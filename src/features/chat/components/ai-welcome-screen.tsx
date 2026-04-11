import { cn } from '@/lib/utils'

const WELCOME_SUGGESTIONS = [
  { emoji: '👤', text: 'Hồ sơ của tôi là gì?' },
  { emoji: '👥', text: 'Danh sách bạn bè của tôi' },
  { emoji: '🌐', text: 'Tìm kiếm thông tin trên Internet' }
]

export function AiWelcomeScreen({ avatarUrl, onSelect }: { avatarUrl?: string; onSelect: (text: string) => void }) {
  return (
    <div className='flex flex-col items-center justify-center flex-1 px-6 py-10 text-center'>
      <div className='w-16 h-16 mb-4'>
        <img
          src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001`}
          alt='Bondhub AI'
          className='w-full h-full rounded-full object-cover shadow-lg border border-black/5'
        />
      </div>
      <h2 className='text-xl font-bold text-foreground mb-2'>Bondhub AI</h2>
      <p className='text-muted-foreground text-sm max-w-xs mb-6'>
        Trợ lý AI thông minh tích hợp dữ liệu hội thoại của bạn. Hỏi bất cứ điều gì!
      </p>
      <div className='flex flex-col gap-2 w-full max-w-sm'>
        {WELCOME_SUGGESTIONS.map(({ emoji, text }) => (
          <button
            key={text}
            onClick={() => onSelect(text)}
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
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
