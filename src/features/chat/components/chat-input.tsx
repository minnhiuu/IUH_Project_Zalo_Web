import { useState, useRef, useEffect, useCallback, useMemo, type FormEvent, type KeyboardEvent } from 'react'
import {
  SendHorizonal,
  Smile,
  Paperclip,
  ImageIcon,
  X,
  Quote,
  ThumbsUp,
  FileIcon,
  Loader2,
  Sparkles,
   Contact, 
   IdCard 
} from 'lucide-react'
import { useAiChat } from '../hooks/use-ai-chat'
import type { GroupMemberListItemResponse, MessageResponse } from '../schemas/chat.schema'
import { MessageType } from '@/constants/enum'
import { useChatContext, type FileAttachment } from '../context/chat-context'
import { useChatText } from '../i18n/use-chat-text'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useGroupMembersInfinite } from '../queries/use-queries'
import { BONDHUB_AI } from '@/constants/system'
import { MentionDropdown } from './mention-dropdown'
import { RichInput, type RichInputRef } from './rich-input'
import { stripMentionsForPreview, isAiMentioned } from '../utils/mention'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BusinessCardDialog, type BusinessCardAsset } from './business-card-dialog'
import { serializeBusinessCard } from '../utils/business-card'
import { AI_SUGGESTION_EVENT } from '../utils/ai-parser'
import ReactMarkdown from 'react-markdown'

const IMAGE_VIDEO_ACCEPT = 'image/*,video/*'
const FILE_ACCEPT = '*/*'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_FILE_SIZE_MB = 50

interface ChatInputProps {
  conversationId: string
  isGroup?: boolean
  replyTo?: MessageResponse | null
  onCancelReply?: () => void
  unreadCount?: number
  snapshotId?: string | null
  onClearSnapshot: () => void
}

export function ChatInput({
  conversationId,
  isGroup,
  replyTo,
  onCancelReply,
  unreadCount = 0,
  snapshotId,
  onClearSnapshot
}: ChatInputProps) {
  const { sendMessage, sendFileMessage, sendTyping } = useChatContext()
  const { text } = useChatText()
  const bc = text.businessCard
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([])
  const [attachmentType, setAttachmentType] = useState<'image' | 'file' | null>(null)
  const [isSending, setIsSending] = useState(false)

  const {
    isSummarizing,
    summaryResult,
    handleSummarize,
    clearSummary,
    sendMessage: sendAiMessage
  } = useAiChat(conversationId, { loadHistory: false })

  // ── AI Summarize Auto-hide logic ──
  useEffect(() => {
    // Nếu không có snapshot hoặc đã tóm tắt xong thì không cần chạy timer
    if (!snapshotId || isSummarizing || summaryResult) return

    // TRƯỜNG HỢP 1: Nếu thực sự đã đọc hết (unreadCount về 0)
    if (unreadCount === 0) {
      // Cho nút hiện thêm 3 giây "vớt vát" sau khi đọc xong để người dùng kịp nhấn
      const timer = setTimeout(() => {
        onClearSnapshot()
      }, 3000)
      return () => clearTimeout(timer)
    }

    // TRƯỜNG HỢP 2: Nếu vẫn còn tin chưa đọc, cho nó hiện tối đa 15s rồi tự ẩn cho đỡ vướng
    const timer = setTimeout(() => {
      onClearSnapshot()
    }, 15000)
    return () => clearTimeout(timer)
  }, [snapshotId, unreadCount, isSummarizing, summaryResult, onClearSnapshot])

  const [businessCardOpen, setBusinessCardOpen] = useState(false)
  // Mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null) // null = closed
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<RichInputRef>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // Group members for @ mention (only fetch when mention is active)
  const { data: membersData } = useGroupMembersInfinite(conversationId, '', mentionQuery !== null)

  const alreadyMentionedIds = useMemo(() => {
    const ids = new Set<string>()
    const matches = htmlContent.matchAll(/data-id="([^"]+)"/g)
    for (const match of matches) {
      ids.add(match[1])
    }
    return ids
  }, [htmlContent])

  const availableMembers = useMemo(() => {
    const baseMembers = (membersData?.pages ?? [])
      .flatMap((p) => p.data)
      .filter((m) => !m.isCurrentUser && !alreadyMentionedIds.has(m.userId))

    if (alreadyMentionedIds.has(BONDHUB_AI.userId)) {
      return baseMembers
    }

    const aiMember: GroupMemberListItemResponse = {
      userId: BONDHUB_AI.userId,
      fullName: BONDHUB_AI.fullName,
      avatar: BONDHUB_AI.avatar,
      phoneNumber: null,
      role: null,
      joinedAt: null,
      isFriend: false,
      isCurrentUser: false,
      joinMethod: null,
      addedBy: null,
      addedByName: null
    }

    return [aiMember, ...baseMembers.filter((member) => member.userId !== BONDHUB_AI.userId)]
  }, [membersData, alreadyMentionedIds])

  // Parse current @ trigger from selection
  const detectMentionTrigger = (): string | null => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    const range = selection.getRangeAt(0)
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return null

    const textBefore = range.startContainer.textContent?.slice(0, range.startOffset) || ''
    const atIdx = textBefore.lastIndexOf('@')
    if (atIdx === -1) return null

    const between = textBefore.slice(atIdx + 1)
    if (/\s/.test(between)) return null // contains space => not a mention trigger
    return between
  }

  // Focus input when opening a new conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [conversationId])

  // Cleanup blob URLs on unmount
  const attachmentsRef = useRef(fileAttachments)
  useEffect(() => {
    attachmentsRef.current = fileAttachments
  }, [fileAttachments])

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)
      })
    }
  }, [])

  // Listen for AI suggestions
  useEffect(() => {
    const handleAiSuggestion = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>
      const suggestionText = customEvent.detail.text
      if (!suggestionText) return

      const aiMember = BONDHUB_AI

      if (inputRef.current) {
        // Clear old content and insert @Bondhub AI + suggestion
        inputRef.current.clear()
        inputRef.current.insertMention(aiMember.fullName, aiMember.userId)

        // Use a small timeout to ensure mention span is inserted before plain text
        setTimeout(() => {
          const el = document.querySelector('[contenteditable="true"]') as HTMLDivElement
          if (el) {
            el.focus()
            const sel = window.getSelection()
            if (sel) {
              const range = document.createRange()
              range.selectNodeContents(el)
              range.collapse(false)
              sel.removeAllRanges()
              sel.addRange(range)
              document.execCommand('insertText', false, ` ${suggestionText}`)
            }
          }
        }, 50)
      }
    }

    window.addEventListener(AI_SUGGESTION_EVENT, handleAiSuggestion)
    return () => window.removeEventListener(AI_SUGGESTION_EVENT, handleAiSuggestion)
  }, [conversationId])

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
        alert(text.input.fileTooLarge(file.name, MAX_FILE_SIZE_MB))
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

  const handleSendBusinessCards = (cards: BusinessCardAsset[]) => {
    const uniqueCards = Array.from(
      new Map(
        cards
          .filter((card) => !!card.userId)
          .map((card) => [card.userId, card])
      ).values()
    )

    uniqueCards.forEach((card) => {
      if (!card.userId) return
      const payload = serializeBusinessCard({
        userId: card.userId,
        name: card.name || 'User',
        phone: card.includePhone === false ? '' : (card.phone || ''),
        avatar: card.avatar || null,
        qrValue: `bondhub://user/${card.userId}?name=${encodeURIComponent(card.name || '')}`
      })
      sendMessage(conversationId, payload)
    })
  }

  const extractSendContent = () => {
    if (!inputRef.current) return content
    let html = inputRef.current.innerHTML

    // Replace mention spans with placeholders so they survive textContent extraction
    html = html.replace(/<span[^>]*data-mention="true"[^>]*>@?(.*?)<\/span>/g, '{{MENTION_START}}$1{{MENTION_END}}')

    // Replace non-breaking spaces
    html = html.replace(/&nbsp;/g, ' ')
    // Replace divs/brs with newlines (for contentEditable multiline support)
    html = html.replace(/<br\s*\/?>/gi, '\n')
    html = html.replace(/<\/div>/gi, '\n').replace(/<div(?:[^>]*)>/gi, '')

    // Strip remaining tags using textContent
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    let rawText = tmp.textContent || tmp.innerText || ''

    // Convert placeholders back to desired format @<mention>Name</mention>
    rawText = rawText.replace(/\{\{MENTION_START\}\}/g, '@<mention>')
    rawText = rawText.replace(/\{\{MENTION_END\}\}/g, '</mention>')

    return rawText
  }

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault()
    if (isSending) return

    const replyMetadata = replyTo
      ? {
          messageId: replyTo.id,
          senderId: replyTo.senderId,
          senderName: replyTo.senderName || '',
          content:
            (replyTo.type === MessageType.Image || replyTo.type === MessageType.Video) && !replyTo.content
              ? replyTo.attachments?.[0]?.url || ''
              : replyTo.content || '',
          type: replyTo.type,
          thumbnailUrl: replyTo.attachments?.[0]?.url || null
        }
      : null

    const sendText = extractSendContent().trim()
    console.log('sendText', sendText)

    // Gửi file/ảnh/video
    if (fileAttachments.length > 0) {
      setIsSending(true)
      try {
        await sendFileMessage(conversationId, fileAttachments, sendText, replyMetadata)
        clearAttachments()
        inputRef.current?.clear()
        setContent('')
        setHtmlContent('')
        onCancelReply?.()
      } finally {
        setIsSending(false)
      }
      // Stop typing indicator
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (isTypingRef.current) {
        isTypingRef.current = false
        sendTyping(conversationId, false, user?.fullName || text.user)
      }
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    // Gửi text thường
    if (!sendText) return

    sendMessage(conversationId, sendText, replyMetadata)

    console.log('isAiMentioned', isAiMentioned(sendText))

    if (isAiMentioned(sendText)) {
      console.log('sendAiMessage (mention mode)')
      sendAiMessage(sendText, true) // QUAN TRỌNG: pass true cho isMention
    }

    inputRef.current?.clear()
    setContent('')
    onCancelReply?.()
    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      sendTyping(conversationId, false, user?.fullName || text.user)
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && mentionQuery !== null) {
      setMentionQuery(null)
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMentionSelect = (fullName: string, userId: string) => {
    inputRef.current?.insertMention(fullName, userId)
    setMentionQuery(null)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const hasContent = content.trim() || fileAttachments.length > 0
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounterRef.current = 0

      const droppedFiles = e.dataTransfer.files
      if (!droppedFiles || droppedFiles.length === 0) return

      const hasMedia = Array.from(droppedFiles).some((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      const isAllMedia = Array.from(droppedFiles).every(
        (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
      )

      if (isAllMedia) {
        // Ảnh/video → thêm vào preview
        const newAttachments: FileAttachment[] = []
        for (let i = 0; i < droppedFiles.length; i++) {
          const file = droppedFiles[i]
          if (file.size > MAX_FILE_SIZE) {
            alert(text.input.fileTooLarge(file.name, MAX_FILE_SIZE_MB))
            continue
          }
          const previewUrl = URL.createObjectURL(file)
          newAttachments.push({ file, previewUrl })
        }
        if (newAttachments.length > 0) {
          if (attachmentType === 'file') clearAttachments()
          setFileAttachments((prev) => [...prev, ...newAttachments])
          setAttachmentType('image')
        }
      } else {
        // File thường → gửi trực tiếp
        const fileOnly = Array.from(droppedFiles).filter(
          (f) => !f.type.startsWith('image/') && !f.type.startsWith('video/')
        )
        const attachments: FileAttachment[] = []
        for (const file of fileOnly) {
          if (file.size > MAX_FILE_SIZE) {
            alert(text.input.fileTooLarge(file.name, MAX_FILE_SIZE_MB))
            continue
          }
          attachments.push({ file })
        }
        if (attachments.length > 0) {
          setIsSending(true)
          try {
            const replyMetadata = replyTo
              ? {
                  messageId: replyTo.id,
                  senderId: replyTo.senderId,
                  senderName: replyTo.senderName || '',
                  content: replyTo.content || '',
                  type: replyTo.type
                }
              : null
            await sendFileMessage(conversationId, attachments, '', replyMetadata)
            onCancelReply?.()
          } finally {
            setIsSending(false)
          }
        }
        // Nếu có cả ảnh lẫn file, thêm ảnh vào preview
        if (hasMedia) {
          const mediaOnly = Array.from(droppedFiles).filter(
            (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
          )
          const mediaAttachments: FileAttachment[] = []
          for (const file of mediaOnly) {
            if (file.size > MAX_FILE_SIZE) continue
            mediaAttachments.push({ file, previewUrl: URL.createObjectURL(file) })
          }
          if (mediaAttachments.length > 0) {
            if (attachmentType === 'file') clearAttachments()
            setFileAttachments((prev) => [...prev, ...mediaAttachments])
            setAttachmentType('image')
          }
        }
      }
    },
    [attachmentType, clearAttachments, conversationId, onCancelReply, replyTo, sendFileMessage, text.input]
  )

  return (
    <div
      className={cn(
        'bg-background border-t border-border flex flex-col p-0 gap-0 relative',
        isDragging && 'ring-2 ring-primary ring-inset'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className='absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-[1px] pointer-events-none rounded'>
          <div className='flex flex-col items-center gap-2 text-primary'>
            <Paperclip size={32} />
            <span className='text-sm font-medium'>{text.input.dropFilesHint}</span>
          </div>
        </div>
      )}
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
        onChange={async (e) => {
          const files = e.target.files
          if (!files || files.length === 0) return

          const attachments: FileAttachment[] = []
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.size > MAX_FILE_SIZE) {
              alert(text.input.fileTooLarge(file.name, MAX_FILE_SIZE_MB))
              continue
            }
            attachments.push({ file })
          }
          e.target.value = ''
          if (attachments.length > 0) {
            setIsSending(true)
            try {
              await sendFileMessage(
                conversationId,
                attachments,
                '',
                replyTo
                  ? {
                      messageId: replyTo.id,
                      senderId: replyTo.senderId,
                      senderName: replyTo.senderName || '',
                      content: replyTo.content || '',
                      type: replyTo.type
                    }
                  : null
              )
              onCancelReply?.()
            } finally {
              setIsSending(false)
            }
          }
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
          title={text.input.sendImageVideoTitle}
        >
          <ImageIcon size={20} />
        </button>
        <button
          type='button'
          onClick={handleFileSelect}
          className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'
          title={text.input.attachFileTitle}
        >
          <Paperclip size={20} />
        </button>
        <div className='w-[1px] h-4 bg-border mx-1' />
        <button
          type='button'
          onClick={() => {
            if (inputRef.current) {
              const el = document.querySelector('[contenteditable="true"]') as HTMLDivElement
              if (el) {
                el.focus()
                const sel = window.getSelection()
                if (sel && sel.rangeCount > 0) {
                  const range = sel.getRangeAt(0)
                  range.insertNode(document.createTextNode('@'))
                  range.collapse(false)
                }
              }
            }
          }}
          className='px-2 py-1 text-[13px] hover:bg-muted rounded text-muted-foreground'
        >
          @
        </button>
        <button
          type='button'
          onClick={() => setBusinessCardOpen(true)}
          className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'
          title={bc.open}
        >
          <Contact size={19} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type='button' className='p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors'>
              <span className='font-bold text-lg'>...</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-52'>
            <DropdownMenuItem onClick={() => setBusinessCardOpen(true)}>
              <IdCard className='mr-2 h-4 w-4' />
              {bc.open}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Floating AI Summarize Button Case */}
      {snapshotId && !summaryResult && (
        <div className='absolute bottom-full left-0 right-0 flex justify-center pb-4 z-40 pointer-events-none'>
          <button
            type='button'
            onClick={() => snapshotId && handleSummarize(snapshotId)}
            disabled={isSummarizing}
            className='pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[13px] font-bold border border-blue-200 dark:border-blue-800 transition-all shadow-xl hover:shadow-blue-200 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300'
          >
            {isSummarizing ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                {text.input.summarizingMessages}
              </>
            ) : (
              <>
                <Sparkles className='w-4 h-4 text-amber-500' />
                {text.input.summarizeNewMessages}
              </>
            )}
          </button>
        </div>
      )}

      {/* AI Summary Result Dialog */}
      {summaryResult && (
        <div className='absolute bottom-full left-4 right-4 mb-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-[60] max-h-[60vh] flex flex-col'>
          <div className='px-4 py-3 border-b border-border bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-between shrink-0'>
            <div className='flex items-center gap-2 text-primary font-bold text-sm'>
              <span className='text-lg'>✨</span> {text.input.summaryTitle}
            </div>
            <button
              onClick={() => {
                clearSummary()
                onClearSnapshot()
              }}
              className='p-1.5 hover:bg-black/5 rounded-full transition-colors'
            >
              <X size={18} />
            </button>
          </div>
          <div className='p-5 overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert max-w-none text-foreground/90'>
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
              {summaryResult}
            </ReactMarkdown>
          </div>
          <div className='px-4 py-3 border-t border-border bg-muted/30 flex justify-end shrink-0'>
            <button
              onClick={() => {
                clearSummary()
                onClearSnapshot()
              }}
              className='px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity'
            >
              {text.input.closeSummary}
            </button>
          </div>
        </div>
      )}

      {/* 2. Trả lời (Reply Preview) */}
      {replyTo && (
        <div className='px-4 py-2 bg-background animate-in slide-in-from-bottom-1 duration-200'>
          <div className='flex items-center justify-between bg-muted px-3 py-2 rounded-md border-l-2 border-primary gap-2'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              {replyTo.type === MessageType.Image && replyTo.attachments?.[0]?.url ? (
                <img src={replyTo.attachments[0].url} alt='' className='w-10 h-10 rounded object-cover shrink-0' />
              ) : replyTo.type === MessageType.Video && replyTo.attachments?.[0]?.url ? (
                <div className='relative w-10 h-10 rounded overflow-hidden shrink-0 bg-muted'>
                  <video
                    src={replyTo.attachments[0].url}
                    className='w-full h-full object-cover'
                    preload='metadata'
                    muted
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='white'>
                      <polygon points='5,3 19,12 5,21' />
                    </svg>
                  </div>
                </div>
              ) : (
                <Quote size={14} className='text-muted-foreground shrink-0' />
              )}
              <div className='flex flex-col min-w-0'>
                <span className='text-[13px] font-medium'>{text.replyingTo(replyTo.senderName || '')}</span>
                <span className='truncate text-[13px] text-muted-foreground'>
                  {replyTo.type === MessageType.Image
                    ? text.type.image
                    : replyTo.type === MessageType.Video
                      ? text.type.video
                      : stripMentionsForPreview(replyTo.content)}
                </span>
              </div>
            </div>
            <button onClick={onCancelReply} className='p-1 hover:bg-muted rounded-full transition-colors shrink-0'>
              <X size={18} className='text-muted-foreground' />
            </button>
          </div>
        </div>
      )}

      {/* 2.5. Image/Video Preview (chỉ hiện cho ảnh/video, file gửi trực tiếp) */}
      {fileAttachments.length > 0 && attachmentType === 'image' && (
        <div className='px-4 py-2 bg-background border-b border-border'>
          <div className='flex gap-2 flex-wrap'>
            {fileAttachments.map((attachment, index) => (
              <div key={index} className='relative group'>
                {attachmentType === 'image' && attachment.previewUrl ? (
                  // Ảnh/Video preview
                  attachment.file.type.startsWith('video/') ? (
                    <div className='relative w-20 h-20 rounded-lg overflow-hidden bg-muted'>
                      <video src={attachment.previewUrl} className='w-full h-full object-cover' muted />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                        <span className='text-white text-xs font-medium'>{text.input.videoBadge}</span>
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
                  <div className='flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border border-border max-w-50'>
                    <FileIcon size={20} className='text-primary shrink-0' />
                    <div className='flex flex-col min-w-0'>
                      <span className='text-[13px] font-medium truncate'>{attachment.file.name}</span>
                      <span className='text-[11px] text-muted-foreground'>{formatFileSize(attachment.file.size)}</span>
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
        className='bg-background flex-1 flex items-center p-2 gap-2 pr-4 min-w-0 relative'
      >
        {/* @ mention dropdown */}
        {mentionQuery !== null && (
          <MentionDropdown
            members={availableMembers}
            query={mentionQuery}
            showAllMention={isGroup && !alreadyMentionedIds.has('all')}
            onSelect={(member) => handleMentionSelect(member.fullName, member.userId)}
            onClose={() => setMentionQuery(null)}
          />
        )}
        <div className='flex-1 min-w-0'>
          <RichInput
            ref={inputRef}
            value={content}
            onChange={(html, textContent) => {
              setContent(textContent)
              setHtmlContent(html)

              // Detect @ trigger
              const trigger = detectMentionTrigger()
              if (trigger !== null) {
                setMentionQuery(trigger)
              } else {
                setMentionQuery(null)
              }

              // Typing indicator
              if (!isTypingRef.current) {
                isTypingRef.current = true
                sendTyping(conversationId, true, user?.fullName || text.user)
              }
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
              typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false
                sendTyping(conversationId, false, user?.fullName || text.user)
              }, 2000)
            }}
            onKeyDown={handleKeyDown}
            placeholder={text.inputPlaceholder}
          />
        </div>
        <div className='flex items-center gap-1'>
          {hasContent ? (
            <button
              type='submit'
              disabled={isSending}
              className='p-2.5 rounded-full flex items-center justify-center transition-all text-primary disabled:opacity-50'
            >
              {isSending ? <Loader2 className='w-6 h-6 animate-spin' /> : <SendHorizonal className='w-6 h-6' />}
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

      <BusinessCardDialog
        open={businessCardOpen}
        onOpenChange={setBusinessCardOpen}
        onSend={handleSendBusinessCards}
      />
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
