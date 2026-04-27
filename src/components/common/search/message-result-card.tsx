import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/user-avatar'
import { formatMessageTime } from '@/utils/date'
import { formatFileSize } from '@/utils/file-size'
import { cn } from '@/lib/utils'
import type { MessageSearchResponse } from '@/features/search/messages/schemas/message-search.schema'
import { useChatText } from '@/features/chat/i18n/use-chat-text'
import { useAuth } from '@/features/auth'
import { Archive } from 'lucide-react'

interface MessageResultCardProps {
  msg: MessageSearchResponse
  variant?: 'message' | 'file'
  isActive?: boolean
  onClick?: () => void
}

export function MessageResultCard({ msg, variant = 'message', isActive, onClick }: MessageResultCardProps) {
  const { i18n, text } = useChatText()
  const { user } = useAuth()
  const isMe = user?.id === msg.senderId
  const senderName = isMe ? text.you : msg.senderName || 'User'

  const containerClass = cn(
    'grid grid-cols-[auto_1fr_auto] grid-rows-[max-content_1fr] pt-[14px] px-4 min-h-[68px] max-h-[88px] gap-x-[10px] gap-y-[2px] cursor-pointer transition-[background-color] duration-75 box-border relative group',
    isActive ? 'bg-(--layer-background-selected)' : 'hover:bg-(--layer-background-subtle)'
  )

  if (variant === 'file') {
    const fileName = msg.displayContent || 'File'
    const ext = fileName.split('.').pop()?.toUpperCase() || ''

    const getFileStyle = (extension: string) => {
      if (['PDF'].includes(extension)) return { bg: 'bg-red-500', label: 'PDF' }
      if (['DOC', 'DOCX'].includes(extension)) return { bg: 'bg-blue-600', label: 'WORD' }
      if (['XLS', 'XLSX'].includes(extension)) return { bg: 'bg-green-600', label: 'EXCEL' }
      if (['PPT', 'PPTX'].includes(extension)) return { bg: 'bg-orange-500', label: 'PPT' }
      if (['ZIP', 'RAR', '7Z'].includes(extension)) return { bg: 'bg-purple-600', label: extension }
      if (['M4A', 'MP3', 'WAV', 'OGG'].includes(extension)) return { bg: 'bg-indigo-600', label: 'AUDIO' }
      if (['MP4', 'MOV', 'AVI', 'MKV'].includes(extension)) return { bg: 'bg-indigo-600', label: 'VIDEO' }
      return { bg: 'bg-primary', label: extension || 'FILE' }
    }

    const { bg, label } = getFileStyle(ext)

    return (
      <div key={msg.messageId} onClick={onClick} className={containerClass}>
        {/* Col 1, Span 2 Rows */}
        <div className={cn('row-span-2 w-12 h-12 shrink-0 rounded flex items-center justify-center text-white', bg)}>
          {['ZIP', 'RAR', '7Z'].includes(ext) ? (
            <Archive size={20} className='text-white' />
          ) : (
            <span className='text-[11px] font-bold tracking-tight leading-none text-center px-0.5'>
              {label.slice(0, 5)}
            </span>
          )}
        </div>

        {/* Col 2, Row 1 */}
        <div className='text-[12px] text-text-secondary truncate leading-tight pt-0.5'>
          {msg.displayHighlights ? (
            <span
              className='[&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold'
              dangerouslySetInnerHTML={{ __html: msg.displayHighlights }}
            />
          ) : (
            <span>{fileName}</span>
          )}
        </div>

        {/* Col 3, Row 1 */}
        <span className='text-[11px] text-text-secondary whitespace-nowrap pt-1'>
          {msg.createdAt && formatMessageTime(msg.createdAt, i18n.language)}
        </span>

        {/* Col 2, Row 2 */}
        <div className='flex items-start gap-2 col-start-2 pb-3'>
          <span className='text-[12px] text-text-secondary truncate'>
            {msg.size ? formatFileSize(msg.size).replace(' ', '') : '0 KB'}
          </span>
        </div>

        {/* Divider line */}
        {!isActive && (
          <div className='absolute bottom-0 left-[76px] right-0 h-[1px] bg-(--divider) group-last:hidden' />
        )}
      </div>
    )
  }

  return (
    <div key={msg.messageId} onClick={onClick} className={containerClass}>
      {/* Col 1, Span 2 Rows */}
      <UserAvatar
        name={msg.senderName || 'User'}
        src={msg.senderAvatar || undefined}
        className='row-span-2 w-12 h-12 shrink-0'
      />

      {/* Col 2, Row 1 */}
      <div className='text-[12px] text-text-secondary truncate leading-none pt-0.5'>
        {msg.conversationName || senderName}
      </div>

      {/* Col 3, Row 1 */}
      <span className='text-[11px] text-text-secondary whitespace-nowrap pt-0.5'>
        {msg.createdAt && formatMessageTime(msg.createdAt, i18n.language)}
      </span>

      {/* Col 2, Row 2 */}
      <div className='col-start-2 text-[13px] text-text-primary line-clamp-2 leading-tight break-words pr-4 pb-3'>
        {renderMessageContent(msg, senderName)}
      </div>

      {/* Divider line */}
      {!isActive && <div className='absolute bottom-0 left-[76px] right-0 h-[1px] bg-(--divider) group-last:hidden' />}
    </div>
  )
}

function renderMessageContent(msg: MessageSearchResponse, senderName: string) {
  const senderPrefix = msg.isGroup ? `${senderName}: ` : ''

  if (msg.displayHighlights) {
    return (
      <span>
        {senderPrefix && <span className='text-text-primary font-normal'>{senderPrefix}</span>}
        <span
          className='[&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold'
          dangerouslySetInnerHTML={{ __html: msg.displayHighlights }}
        />
      </span>
    )
  }
  return (
    <span>
      {senderPrefix && <span className='text-text-primary/70 font-normal'>{senderPrefix}</span>}
      {msg.displayContent || ''}
    </span>
  )
}

export function MessageResultSkeleton({ variant = 'message' }: { variant?: 'message' | 'file' }) {
  return (
    <div className='flex items-start gap-3 px-4 py-3 group relative'>
      <Skeleton className={cn('w-10 h-10 shrink-0 mt-0.5', variant === 'file' ? 'rounded' : 'rounded-full')} />
      <div className='flex-1 min-w-0 space-y-2'>
        {variant === 'file' ? (
          <>
            <Skeleton className='h-3.5 w-3/4' />
            <div className='flex items-center justify-between gap-2 pt-1'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-2 w-12' />
            </div>
          </>
        ) : (
          <>
            <div className='flex items-center justify-between gap-2'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-2 w-12' />
            </div>
            <div className='space-y-1.5'>
              <Skeleton className='h-3 w-full' />
              <Skeleton className='h-3 w-4/5' />
            </div>
          </>
        )}
      </div>
      <div className='absolute bottom-0 left-[72px] right-0 h-[1px] bg-(--divider) group-last:hidden' />
    </div>
  )
}
