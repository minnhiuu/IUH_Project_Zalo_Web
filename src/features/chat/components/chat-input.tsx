import { useState, FormEvent, useRef, KeyboardEvent } from 'react'
import { SendHorizonal, Smile, Paperclip, ImageIcon } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useChatContext } from '../context/chat-context'
import { useChatText } from '../i18n/use-chat-text'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  recipientId: string
}

export function ChatInput({ recipientId }: ChatInputProps) {
  const { sendMessage } = useChatContext()
  const { text } = useChatText()
  const [content, setContent] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault()
    if (!content.trim()) return
    sendMessage(recipientId, content)
    setContent('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSend}
      className='bg-background border-t border-border flex items-end p-3 gap-2'
    >
      <div className='flex gap-1 mb-1'>
        <button type='button' className='p-2 hover:bg-muted rounded-full text-muted-foreground'>
          <Paperclip className='w-5 h-5' />
        </button>
        <button type='button' className='p-2 hover:bg-muted rounded-full text-muted-foreground'>
          <ImageIcon className='w-5 h-5' />
        </button>
      </div>
      <div className='flex-1 relative bg-muted rounded-xl border border-transparent hover:border-border transition-colors'>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={text.inputPlaceholder}
          className='min-h-[40px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-none py-2.5 px-4 text-[15px]'
          rows={1}
        />
        <button
          type='button'
          className='absolute right-2 bottom-2 p-1.5 hover:bg-background rounded-full text-muted-foreground transition-colors'
        >
          <Smile className='w-5 h-5' />
        </button>
      </div>
      <button
        type='submit'
        disabled={!content.trim()}
        className={cn(
          'p-2.5 rounded-full flex items-center justify-center transition-colors mb-0.5',
          content.trim() ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground'
        )}
      >
        <SendHorizonal className='w-5 h-5' />
      </button>
    </form>
  )
}
