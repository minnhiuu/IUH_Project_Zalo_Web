import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiMessage } from '../hooks/use-ai-chat'
import { useChatText } from '../i18n/use-chat-text'
import { AiSuggestionChips } from './ai-suggestion-chips'
import ReactMarkdown from 'react-markdown'

export function AiMessageBubble({
  msg,
  avatarUrl,
  onSuggestionClick,
  isLoading
}: {
  msg: AiMessage
  avatarUrl?: string
  onSuggestionClick: (text: string) => void
  isLoading: boolean
}) {
  const isUser = msg.role === 'user'
  const { text } = useChatText()
  const statusLabel = text.aiStatusLabel(msg.processingStatus)

  return (
    <div className={cn('flex flex-col w-full px-2 mt-3', isUser ? 'items-end' : 'items-start')}>
      <div className={cn('flex gap-2 w-full', isUser ? 'justify-end' : 'justify-start')}>
        {!isUser && (
          <div className='w-8 h-8 shrink-0'>
            <img
              src={avatarUrl || `/images/bondhub-ai.png`}
              alt='Bondhub AI'
              className='w-full h-full rounded-full object-cover border border-black/5 shadow-md'
            />
          </div>
        )}

        <div className='flex flex-col max-w-[75%]'>
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm wrap-break-word',
              isUser
                ? 'bg-[#e5efff] text-black dark:bg-primary dark:text-primary-foreground rounded-tr-md'
                : msg.isClarification
                  ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 rounded-bl-md'
                  : 'bg-white dark:bg-zinc-900 text-foreground rounded-bl-md'
            )}
          >
            {msg.isClarification && (
              <div className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[13px] font-semibold mb-1.5'>
                <HelpCircle size={14} />
                <span>{text.aiWindow.clarificationNeeded}</span>
              </div>
            )}
            {!isUser && msg.isStreaming && !!msg.processingStatus && (
              <div className='flex items-center gap-1.5 text-[11px] text-blue-500 dark:text-blue-400 italic mb-1 select-none'>
                <span className='flex items-center gap-0.75'>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className='w-1.25 h-1.25 rounded-full bg-blue-400 animate-bounce'
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </span>
                <span>{statusLabel}</span>
              </div>
            )}

            <div className='markdown-content prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed'>
              <ReactMarkdown
                components={{
                  h2: ({ ...props }) => <h2 className='text-lg font-bold mt-2 mb-1' {...props} />,
                  h3: ({ ...props }) => <h3 className='text-base font-bold mt-2 mb-1' {...props} />,
                  p: ({ ...props }) => <p className='mb-1.5 last:mb-0' {...props} />,
                  ul: ({ ...props }) => <ul className='list-disc ml-5 mb-1.5' {...props} />,
                  ol: ({ ...props }) => <ol className='list-decimal ml-5 mb-1.5' {...props} />,
                  li: ({ ...props }) => <li className='mb-0.5' {...props} />,
                  strong: ({ ...props }) => <strong className='font-bold dark:text-blue-300' {...props} />
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>

            {msg.isStreaming && !msg.processingStatus && (
              <span className='inline-block w-0.5 h-4 ml-0.5 bg-blue-500 animate-pulse align-middle' />
            )}
          </div>
          <span className='text-[11px] text-muted-foreground mt-1 px-1'>
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Follow-up chips */}
      {!isUser && !msg.isStreaming && !!msg.suggestions?.length && (
        <div className='ml-10'>
          <AiSuggestionChips suggestions={msg.suggestions} onSelect={onSuggestionClick} disabled={isLoading} />
        </div>
      )}
    </div>
  )
}
