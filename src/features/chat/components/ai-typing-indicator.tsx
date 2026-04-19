export function AiTypingIndicator({ avatarUrl }: { avatarUrl?: string }) {
  return (
    <div className='flex items-end gap-2 px-2 mt-3'>
      <div className='w-8 h-8 shrink-0'>
        <img
          src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001`}
          alt='Bondhub AI'
          className='w-full h-full rounded-full object-cover border border-black/5 shadow-md'
        />
      </div>
      <div className='bg-white dark:bg-zinc-900 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm'>
        <div className='flex items-center gap-1.5'>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
