import { useEffect, useRef, useState, type KeyboardEvent, type FormEvent } from 'react'
import { SendHorizonal, Sparkles, RotateCcw, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { useAiChat } from '../hooks/use-ai-chat'
import type { AiMessage } from '../hooks/use-ai-chat'
import type { AiProcessingStatus } from '@/constants/enum'
import { useChatText } from '../i18n/use-chat-text'
import type { ConversationResponse } from '../schemas/chat.schema'

interface AiChatWindowProps {
  conversation: ConversationResponse
}

// ── Compact status bar ─────────────────────────────────────────────────────────
function AiStatusBar({ statusEnum }: { statusEnum?: AiProcessingStatus }) {
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

// ── Typing indicator ───────────────────────────────────────────────────────────
function TypingIndicator({ avatarUrl }: { avatarUrl?: string }) {
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

// ── Follow-up suggestion chips ─────────────────────────────────────────────────
function SuggestionChips({
  suggestions,
  onSelect,
  disabled,
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

// ── Single message bubble ──────────────────────────────────────────────────────
function AiMessageBubble({
  msg,
  avatarUrl,
  onSuggestionClick,
  isLoading,
}: {
  msg: AiMessage
  avatarUrl?: string
  onSuggestionClick: (text: string) => void
  isLoading: boolean
}) {
  const isUser = msg.role === 'user'

  return (
    <div className={cn('flex flex-col w-full px-2 mt-3', isUser ? 'items-end' : 'items-start')}>
      <div className={cn('flex gap-2 w-full', isUser ? 'justify-end' : 'justify-start')}>
        {!isUser && (
          <div className='w-8 h-8 shrink-0'>
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001`}
              alt='Bondhub AI'
              className='w-full h-full rounded-full object-cover border border-black/5 shadow-md'
            />
          </div>
        )}

        <div className='flex flex-col max-w-[75%]'>
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm break-words',
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
                <span>Cần thêm thông tin</span>
              </div>
            )}
            <span className='whitespace-pre-wrap'>{msg.content}</span>
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
          <SuggestionChips
            suggestions={msg.suggestions}
            onSelect={onSuggestionClick}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  )
}

// ── Welcome screen ─────────────────────────────────────────────────────────────
const WELCOME_SUGGESTIONS = [
  { emoji: '👤', text: 'Hồ sơ của tôi là gì?' },
  { emoji: '👥', text: 'Danh sách bạn bè của tôi' },
  { emoji: '🌐', text: 'Tìm kiếm thông tin trên Internet' },
]

function WelcomeScreen({
  avatarUrl,
  onSelect,
}: {
  avatarUrl?: string
  onSelect: (text: string) => void
}) {
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

// ── Main AI Chat Window ────────────────────────────────────────────────────────
export function AiChatWindow({ conversation }: AiChatWindowProps) {
  const { messages, isLoading, sendMessage, clearHistory } = useAiChat(conversation.id)
  const [content, setContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [conversation.id, isLoading])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || isLoading) return
    sendMessage(trimmed)
    setContent('')
  }

  const handleSuggestionClick = (text: string) => {
    if (isLoading) return
    sendMessage(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='flex-1 flex flex-col h-full overflow-hidden bg-[#eef0f1] dark:bg-zinc-950'>
      {/* Header */}
      <div className='h-[68px] border-b border-border bg-background flex items-center justify-between px-4 shrink-0 shadow-sm z-10'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10'>
            <img
              src={conversation.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001`}
              alt='Bondhub AI'
              className='w-full h-full rounded-full object-cover shadow-md border border-black/5'
            />
          </div>
          <div>
            <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight'>Bondhub AI</h2>
            <p className='text-[12px] text-blue-500 dark:text-blue-400 mt-0.5 leading-tight flex items-center gap-1'>

              <span className='inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
              Trợ lý AI
            </p>
          </div>
        </div>
        <button
          onClick={clearHistory}
          title='Cuộc hội thoại mới'
          className='p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground cursor-pointer'
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto px-2 py-4 flex flex-col custom-scrollbar'>
        {messages.length === 0 ? (
          <WelcomeScreen
            avatarUrl={conversation.avatar || undefined}
            onSelect={handleSuggestionClick}
          />
        ) : (
          <>
            {messages.map((msg) => (
              <AiMessageBubble
                key={msg.id}
                msg={msg}
                avatarUrl={conversation.avatar || undefined}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isLoading}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'ai' && (
              <TypingIndicator avatarUrl={conversation.avatar || undefined} />
            )}
          </>
        )}
      </div>

      {/* Input + AI Status bar */}
      <div className='bg-background border-t border-border flex flex-col p-0 gap-0'>
        {(() => {
          const lastMsg = messages[messages.length - 1]
          const isStreamingWithStatus =
            isLoading && lastMsg?.role === 'ai' && lastMsg?.isStreaming && lastMsg?.processingStatus
          return isStreamingWithStatus ? <AiStatusBar statusEnum={lastMsg?.processingStatus} /> : null
        })()}
        <form onSubmit={handleSend} className='flex items-center p-2 gap-2 pr-4'>
          <div className='flex-1 min-w-0'>
            <Textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Hỏi Bondhub AI bất cứ điều gì...'
              disabled={isLoading}
              className='min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 shadow-none resize-none py-2.5 px-4 text-[16px] break-words disabled:opacity-50'
              rows={1}
            />
          </div>
          <button
            type='submit'
            disabled={!content.trim() || isLoading}
            className={cn(
              'p-2.5 rounded-full flex items-center justify-center transition-all',
              content.trim() && !isLoading
                ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer'
                : 'text-muted-foreground opacity-40 cursor-not-allowed'
            )}
          >
            <SendHorizonal className='w-6 h-6' />
          </button>
        </form>
      </div>
    </div>
  )
}
