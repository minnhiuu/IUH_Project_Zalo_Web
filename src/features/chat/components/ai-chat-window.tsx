import { useEffect, useRef, useState, type KeyboardEvent, type FormEvent } from 'react'
import { SendHorizonal, Sparkles, RotateCcw, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { useAiChat, type AiMessage } from '../hooks/use-ai-chat'
import type { ConversationResponse } from '../schemas/chat.schema'

interface AiChatWindowProps {
  conversation: ConversationResponse
}

// ── Typing dots indicator ──────────────────────────────────────────────────────
function TypingIndicator({ avatarUrl }: { avatarUrl?: string }) {
  return (
    <div className='flex items-end gap-2 px-2 mt-4'>
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
              className='w-2 h-2 bg-violet-400 rounded-full animate-bounce'
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Single message bubble ──────────────────────────────────────────────────────
function AiMessageBubble({ msg, avatarUrl }: { msg: AiMessage; avatarUrl?: string }) {
  const isUser = msg.role === 'user'

  return (
    <div className={cn('flex w-full px-2 gap-2 mt-3', isUser ? 'justify-end' : 'justify-start')}>
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
          {msg.isStreaming && (
            <span className='inline-block w-0.5 h-4 ml-0.5 bg-violet-500 animate-pulse align-middle' />
          )}
        </div>
        <span className='text-[11px] text-muted-foreground mt-1 px-1'>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// ── Welcome screen (empty state) ───────────────────────────────────────────────
function WelcomeScreen({ avatarUrl }: { avatarUrl?: string }) {
  const suggestedQueries = [
    'Tóm tắt các cuộc trò chuyện gần đây',
    'Ai trong nhóm của tôi nói về điều gì?',
    'Tìm kiếm thông tin liên quan đến dự án'
  ]
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
        {suggestedQueries.map((q) => (
          <button
            key={q}
            className='text-left px-4 py-2.5 rounded-xl border border-border hover:bg-muted/60 text-sm text-foreground/80 transition-colors'
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main AI Chat Window ────────────────────────────────────────────────────────
export function AiChatWindow({ conversation }: AiChatWindowProps) {
  const { messages, isLoading, sendMessage, clearHistory } = useAiChat(
    conversation.conversationId,
    conversation.partnerId
  )
  const [content, setContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus input when conversation changes or loading finishes
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [conversation.conversationId, isLoading])

  // Auto-scroll to bottom on new messages
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
              src={conversation.partnerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001`}
              alt='Bondhub AI'
              className='w-full h-full rounded-full object-cover shadow-md border border-black/5'
            />
          </div>
          <div>
            <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight'>Bondhub AI</h2>
            <p className='text-[12px] text-violet-500 dark:text-violet-400 mt-0.5 leading-tight flex items-center gap-1'>
              <span className='inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse' />
              Trợ lý AI thông minh
            </p>
          </div>
        </div>
        <button
          onClick={clearHistory}
          title='Cuộc hội thoại mới'
          className='p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground'
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto px-2 py-4 flex flex-col custom-scrollbar'>
        {messages.length === 0 ? (
          <WelcomeScreen avatarUrl={conversation.partnerAvatar || undefined} />
        ) : (
          <>
            {messages.map((msg) => (
              <AiMessageBubble key={msg.id} msg={msg} avatarUrl={conversation.partnerAvatar || undefined} />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'ai' && (
              <TypingIndicator avatarUrl={conversation.partnerAvatar || undefined} />
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className='bg-background border-t border-border flex flex-col p-0 gap-0'>
        <div className='flex items-center px-4 py-2 border-b border-border bg-violet-50 dark:bg-violet-950/20 gap-2 text-[13px] text-violet-600 dark:text-violet-400'>
          <Sparkles size={14} />
          <span>Powered by Bondhub AI • CRAG Pipeline</span>
        </div>
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
                ? 'text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900'
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
