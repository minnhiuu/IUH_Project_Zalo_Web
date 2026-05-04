import { useEffect, useRef, useState, type KeyboardEvent, type FormEvent } from 'react'
import { SendHorizonal, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { useAiChat } from '../hooks/use-ai-chat'
import type { ConversationResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'

interface AiChatWindowProps {
  conversation: ConversationResponse
}

import { AiTypingIndicator } from './ai-typing-indicator'
import { AiMessageBubble } from './ai-message-bubble'
import { AiWelcomeScreen } from './ai-welcome-screen'

// ── Main AI Chat Window ────────────────────────────────────────────────────────
export function AiChatWindow({ conversation }: AiChatWindowProps) {
  const { messages, isLoading, sendMessage, clearHistory } = useAiChat(conversation.id, { loadHistory: true })
  const { text } = useChatText()
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
      <div className='h-17 border-b border-border bg-background flex items-center justify-between px-4 shrink-0 shadow-sm z-10'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10'>
            <img
              src={conversation.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001`}
              alt={text.aiWindow.title}
              className='w-full h-full rounded-full object-cover shadow-md border border-black/5'
            />
          </div>
          <div>
            <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight'>{text.aiWindow.title}</h2>
            <p className='text-[12px] text-blue-500 dark:text-blue-400 mt-0.5 leading-tight flex items-center gap-1'>
              <span className='inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
              {text.aiWindow.assistantTag}
            </p>
          </div>
        </div>
        <button
          onClick={clearHistory}
          title={text.aiWindow.newConversation}
          className='p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground cursor-pointer'
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto px-2 py-4 flex flex-col custom-scrollbar'>
        {messages.length === 0 ? (
          <AiWelcomeScreen avatarUrl={conversation.avatar || undefined} onSelect={handleSuggestionClick} />
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
              <AiTypingIndicator avatarUrl={conversation.avatar || undefined} />
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className='bg-background border-t border-border flex flex-col p-0 gap-0'>
        <form onSubmit={handleSend} className='flex items-center p-2 gap-2 pr-4'>
          <div className='flex-1 min-w-0'>
            <Textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={text.aiWindow.inputPlaceholder}
              disabled={isLoading}
              className='min-h-11 max-h-30 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none py-2.5 px-4 text-[16px] wrap-break-word disabled:opacity-50'
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
