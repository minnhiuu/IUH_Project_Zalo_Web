import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { SendHorizonal, Smile, Paperclip, ImageIcon, X, Quote, ThumbsUp, FileIcon, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatContext, type FileAttachment } from '../context/chat-context'
import { useChatText } from '../i18n/use-chat-text'
import { useAuth } from '@/features/auth/hooks/use-auth'

const IMAGE_VIDEO_ACCEPT = 'image/*,video/*'
const FILE_ACCEPT = '*/*'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface ChatInputProps {
  conversationId: string
  replyTo?: MessageResponse | null
  onCancelReply?: () => void
}

export function ChatInput({ conversationId, replyTo, onCancelReply }: ChatInputProps) {
  const { sendMessage, sendFileMessage, sendTyping } = useChatContext()
  const { text } = useChatText()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([])
  const [attachmentType, setAttachmentType] = useState<'image' | 'file' | null>(null)
  const [isSending, setIsSending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // Focus input when opening a new conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [conversationId])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      fileAttachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)
      })
    }
  }, [])

  const clearAttachments = useCallback(() => {
    fileAttachments.forEach((a) => {
      if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)
    })
    setFileAttachments([])
    setAttachmentType(null)
  }, [fileAttachments])

  const handleImageSelect = () => {
    if (attachmentType === 'file') clearAttachments()
    imageInputRef.current?.click()
  }

  const handleFileSelect = () => {
    if (attachmentType === 'image') clearAttachments()
    fileInputRef.current?.click()
  }

  const handleFilesChange = (files: FileList | null, type: 'image' | 'file') => {
    if (!files || files.length === 0) return

    const newAttachments: FileAttachment[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" vượt quá 50MB`)
        continue
      }

      const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/')
      const previewUrl = isMedia ? URL.createObjectURL(file) : undefined
      newAttachments.push({ file, previewUrl })
    }

    if (newAttachments.length > 0) {
      setFileAttachments((prev) => [...prev, ...newAttachments])
      setAttachmentType(type)
    }
  }

  const removeAttachment = (index: number) => {
    setFileAttachments((prev) => {
      const removed = prev[index]
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) setAttachmentType(null)
      return next
    })
  }

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault()
    if (isSending) return

    const replyMetadata = replyTo
      ? {
          messageId: replyTo.id,
          senderId: replyTo.senderId,
          senderName: replyTo.senderName || '',
          content: replyTo.content || '',
          type: replyTo.type
        }
      : null

    // Gửi file/ảnh/video
    if (fileAttachments.length > 0) {
      setIsSending(true)
      try {
        await sendFileMessage(conversationId, fileAttachments, replyMetadata)
        clearAttachments()
        onCancelReply?.()
      } finally {
        setIsSending(false)
      }
      // Nếu có text kèm theo, gửi riêng
      if (content.trim()) {
        sendMessage(conversationId, content)
        setContent('')
      }
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    // Gửi text thường
    if (!content.trim()) return
    sendMessage(conversationId, content, replyMetadata)
    setContent('')
    onCancelReply?.()
    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      sendTyping(conversationId, false, user?.fullName || 'Người dùng')
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasContent = content.trim() || fileAttachments.length > 0

  return (
    <div className='bg-background border-t border-border flex flex-col p-0 gap-0'>
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type='file'
        accept={IMAGE_VIDEO_ACCEPT}
        multiple
        className='hidden'
        onChange={(e) => {
          handleFilesChange(e.target.files, 'image')
          e.target.value = ''
        }}
      />
      <input
        ref={fileInputRef}
        type='file'
        accept={FILE_ACCEPT}
        multiple
        className='hidden'
        onChange={(e) => {
          handleFilesChange(e.target.files, 'file')
          e.target.value = ''
        }}
      />

      {/* 1. Thanh công cụ (Toolbar) */}
      <div className='flex items-center px-4 py-2 border-b border-border bg-background gap-1 overflow-x-auto no-scrollbar shrink-0'>
        <button type='button' className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'>
          <Smile size={20} />
        </button>
        <button
          type='button'
          onClick={handleImageSelect}
          className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'
          title='Gửi ảnh/video'
        >
          <ImageIcon size={20} />
        </button>
        <button
          type='button'
          onClick={handleFileSelect}
          className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'
          title='Đính kèm file'
        >
          <Paperclip size={20} />
        </button>
        <div className='w-[1px] h-4 bg-border mx-1' />
        <button type='button' className='px-2 py-1 text-[13px] hover:bg-muted rounded text-muted-foreground'>@</button>
        <button type='button' className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'>
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

      {/* 2.5. File/Image Preview */}
      {fileAttachments.length > 0 && (
        <div className='px-4 py-2 bg-background border-b border-border'>
          <div className='flex gap-2 flex-wrap'>
            {fileAttachments.map((attachment, index) => (
              <div key={index} className='relative group'>
                {attachmentType === 'image' && attachment.previewUrl ? (
                  // Ảnh/Video preview
                  attachment.file.type.startsWith('video/') ? (
                    <div className='relative w-20 h-20 rounded-lg overflow-hidden bg-muted'>
                      <video
                        src={attachment.previewUrl}
                        className='w-full h-full object-cover'
                        muted
                      />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                        <span className='text-white text-xs font-medium'>VIDEO</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.file.name}
                      className='w-20 h-20 rounded-lg object-cover border border-border'
                    />
                  )
                ) : (
                  // File preview
                  <div className='flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border border-border max-w-[200px]'>
                    <FileIcon size={20} className='text-primary shrink-0' />
                    <div className='flex flex-col min-w-0'>
                      <span className='text-[13px] font-medium truncate'>{attachment.file.name}</span>
                      <span className='text-[11px] text-muted-foreground'>
                        {formatFileSize(attachment.file.size)}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  type='button'
                  onClick={() => removeAttachment(index)}
                  className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm'
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {/* Nút thêm file */}
            <button
              type='button'
              onClick={attachmentType === 'image' ? handleImageSelect : handleFileSelect}
              className='w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors'
            >
              <span className='text-2xl'>+</span>
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
            onChange={(e) => {
              setContent(e.target.value)
              // Typing indicator
              if (!isTypingRef.current) {
                isTypingRef.current = true
                sendTyping(conversationId, true, user?.fullName || 'Người dùng')
              }
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
              typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false
                sendTyping(conversationId, false, user?.fullName || 'Người dùng')
              }, 2000)
            }}
            onKeyDown={handleKeyDown}
            placeholder={text.inputPlaceholder}
            className='min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 shadow-none resize-none py-2.5 px-4 text-[16px] break-words'
            rows={1}
          />
        </div>
        <div className='flex items-center gap-1'>
          {hasContent ? (
            <button
              type='submit'
              disabled={isSending}
              className='p-2.5 rounded-full flex items-center justify-center transition-all text-primary disabled:opacity-50'
            >
              {isSending ? (
                <Loader2 className='w-6 h-6 animate-spin' />
              ) : (
                <SendHorizonal className='w-6 h-6' />
              )}
            </button>
          ) : (
            <div className='relative group/like flex items-center justify-center w-11 h-11 shrink-0'>
              {/* Reaction Picker Popover */}
              <div className='absolute bottom-[calc(100%+12px)] right-0 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-border rounded-full shadow-2xl px-4 py-2.5 opacity-0 pointer-events-none group-hover/like:opacity-100 group-hover/like:pointer-events-auto flex items-center gap-3.5 transition-all duration-200 z-50 after:content-[""] after:absolute after:top-full after:left-0 after:right-0 after:h-4'>
                {['👍', '❤️', '🤣', '😮', '😢', '😡'].map((emoji) => (
                  <button
                    key={emoji}
                    type='button'
                    onClick={() => sendMessage(conversationId, emoji)}
                    className='text-3xl leading-none hover:scale-125 transition-transform cursor-pointer focus:outline-none'
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                type='button'
                onClick={() => sendMessage(conversationId, '👍')}
                className='w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-muted/50'
              >
                <ThumbsUp className='w-6 h-6 text-amber-500 hover:scale-110 active:scale-90 transition-transform' />
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
