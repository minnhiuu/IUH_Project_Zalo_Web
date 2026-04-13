import { useChatText } from '../i18n/use-chat-text'
import type { TypingEvent } from '../schemas/chat.schema'

interface TypingIndicatorProps {
  typingUsers: TypingEvent[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const { text } = useChatText()

  if (typingUsers.length === 0) return null

  const getLabel = () => {
    if (typingUsers.length === 1) {
      const user = typingUsers[0]
      return user.platform === 'PC'
        ? text.system.typing.one_pc(user.userName)
        : text.system.typing.one(user.userName)
    }
    if (typingUsers.length === 2) {
      return text.system.typing.two(typingUsers[0].userName, typingUsers[1].userName)
    }
    return text.system.typing.many(
      typingUsers[0].userName,
      typingUsers[1].userName,
      typingUsers.length - 2
    )
  }

  return (
    <div className='flex items-center gap-2 px-0 py-1'>
      {/* Animated dots */}
      <div className='flex items-center gap-1'>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className='w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce'
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.9s' }}
          />
        ))}
      </div>
      <span className='text-[12px] text-muted-foreground italic'>{getLabel()}</span>
    </div>
  )
}
