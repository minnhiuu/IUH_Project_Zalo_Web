import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/user-avatar'
import { formatMessageTime } from '@/utils/date'
import { formatFileSize } from '@/utils/file-size'
import { cn } from '@/lib/utils'
import type { MessageSearchResponse } from '../../../../features/search/messages/schemas/message-search.schema'
import { useChatText } from '../../i18n/use-chat-text'
import { Archive } from 'lucide-react'

interface MessageResultCardProps {
  msg: MessageSearchResponse
  variant?: 'message' | 'file'
  isActive?: boolean
  onClick?: () => void
}

export function MessageResultCard({ msg, variant = 'message', isActive, onClick }: MessageResultCardProps) {
  const { i18n } = useChatText()
  
  const containerClass = cn(
    'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group relative',
    isActive ? 'bg-(--layer-background-selected)' : 'hover:bg-(--layer-background-hover)'
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
      <div
        key={msg.messageId}
        onClick={onClick}
        className={containerClass}
      >
        <div className={cn('w-10 h-10 shrink-0 rounded flex items-center justify-center text-white mt-0.5', bg)}>
          {['ZIP', 'RAR', '7Z'].includes(ext) ? (
            <Archive size={18} className='text-white' />
          ) : (
            <span className='text-[10px] font-bold tracking-tight leading-none text-center px-0.5'>
              {label.slice(0, 5)}
            </span>
          )}
        </div>
        <div className='flex-1 min-w-0 flex flex-col justify-center min-h-[40px]'>
          <div className='text-[14px] text-text-primary font-medium truncate'>
            {msg.displayHighlights ? (
              <span 
                className='[&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold' 
                dangerouslySetInnerHTML={{ __html: msg.displayHighlights }} 
              />
            ) : (
              <span>{fileName}</span>
            )}
          </div>
          <div className='flex items-center justify-between gap-2 mt-0.5'>
            <span className='text-[12px] text-text-secondary truncate'>{msg.size ? formatFileSize(msg.size).replace(' ', '') : '0 KB'}</span>
            <span className='text-[11px] text-text-secondary whitespace-nowrap shrink-0'>
              {msg.createdAt && formatMessageTime(msg.createdAt, i18n.language)}
            </span>
          </div>
        </div>
        {/* Divider line */}
        {!isActive && (
          <div className='absolute bottom-0 left-[72px] right-0 h-[1px] bg-(--divider) group-last:hidden' />
        )}
      </div>
    )
  }

  return (
    <div
      key={msg.messageId}
      onClick={onClick}
      className={containerClass}
    >
      <UserAvatar
        name={msg.senderName || 'User'}
        src={msg.senderAvatar || undefined}
        className='w-10 h-10 shrink-0 mt-0.5'
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2 mb-1'>
          <span className='text-[12px] text-text-secondary truncate'>{msg.senderName || 'User'}</span>
          <span className='text-[11px] text-text-secondary whitespace-nowrap shrink-0'>
            {msg.createdAt && formatMessageTime(msg.createdAt, i18n.language)}
          </span>
        </div>
        <div className='text-[13px] line-clamp-2 leading-snug break-words'>{renderMessageContent(msg)}</div>
      </div>
      {/* Divider line */}
      {!isActive && (
        <div className='absolute bottom-0 left-[72px] right-0 h-[1px] bg-(--divider) group-last:hidden' />
      )}
    </div>
  )
}

function renderMessageContent(msg: MessageSearchResponse) {
  if (msg.displayHighlights) {
    return <span className='[&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold' dangerouslySetInnerHTML={{ __html: msg.displayHighlights }} />
  }
  return <span>{msg.displayContent || ''}</span>
}

export function MessageResultSkeleton({ variant = 'message' }: { variant?: 'message' | 'file' }) {
  return (
    <div className='flex items-start gap-3 px-4 py-3 group relative'>
      <Skeleton className={cn("w-10 h-10 shrink-0 mt-0.5", variant === 'file' ? 'rounded' : 'rounded-full')} />
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
