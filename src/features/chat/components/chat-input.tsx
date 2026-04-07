import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { SendHorizonal, Smile, Paperclip, ImageIcon, X, Quote, ThumbsUp } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatContext } from '../context/chat-context'
import { useChatText } from '../i18n/use-chat-text'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  conversationId: string
  replyTo?: MessageResponse | null
  onCancelReply?: () => void
}

export function ChatInput({ conversationId, replyTo, onCancelReply }: ChatInputProps) {
  const { sendMessage } = useChatContext()
  const { text } = useChatText()
  const [content, setContent] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Focus input when opening a new conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [conversationId])

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault()
    if (!content.trim()) return

    const replyMetadata = replyTo
      ? {
          messageId: replyTo.id,
          senderId: replyTo.senderId,
          senderName: replyTo.senderName || '',
          content: replyTo.content || '',
          type: replyTo.type
        }
      : null

    sendMessage(conversationId, content, replyMetadata)
    setContent('')
    onCancelReply?.()

    // Auto-focus after send
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='bg-background border-t border-border flex flex-col p-0 gap-0'>
      {/* 1. Thành công cụ (Toolbar) */}
      <div className='flex items-center px-4 py-2 border-b border-border bg-background gap-1 overflow-x-auto no-scrollbar shrink-0'>
        <button className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'>
          <Smile size={20} />
        </button>
        <button className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'>
          <ImageIcon size={20} />
        </button>
        <button className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'>
          <Paperclip size={20} />
        </button>
        <div className='w-[1px] h-4 bg-border mx-1' />
        <button className='px-2 py-1 text-[13px] hover:bg-muted rounded text-muted-foreground'>@</button>
        <button className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'>
          <span className='font-bold text-lg'>...</span>
        </button>
      </div>

      {/* 2. Trả lời (Reply Preview) */}
      {replyTo && (
        <div className='px-4 py-2 bg-background animate-in slide-in-from-bottom-1 duration-200'>
          <div className='flex items-center justify-between bg-muted px-4 py-2.5 rounded-md border-l-2 border-primary'>
            <div className='flex items-start gap-2 truncate'>
              <Quote size={14} className='text-muted-foreground mt-1 shrink-0' />
              <div className='flex flex-col truncate'>
                <span className='text-[13px]'>{text.replyingTo(replyTo.senderName || '')}</span>
                <span className='truncate text-[13px] text-muted-foreground max-w-[600px]'>{replyTo.content}</span>
              </div>
            </div>
            <button onClick={onCancelReply} className='p-1 hover:bg-muted rounded-full transition-colors shrink-0 ml-2'>
              <X size={18} className='text-muted-foreground' />
            </button>
          </div>
        </div>
      )}

      {/* 3. Chat Input */}
      <form
        ref={formRef}
        onSubmit={handleSend}
        className='bg-background flex-1 flex items-center p-2 gap-2 pr-4 min-w-0'
      >
        <div className='flex-1 min-w-0'>
          <Textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={text.inputPlaceholder}
            className='min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 shadow-none resize-none py-2.5 px-4 text-[16px] break-words'
            rows={1}
          />
        </div>
        <div className='flex items-center gap-1'>
          <button
            type='submit'
            className={cn(
              'p-2.5 rounded-full flex items-center justify-center transition-all',
              content.trim() ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {content.trim() ? (
              <SendHorizonal className='w-6 h-6' />
            ) : (
              <ThumbsUp className='w-6 h-6 text-amber-500 hover:scale-110 active:scale-90 transition-transform' />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
