import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/user-avatar'
import { MessageType } from '@/constants/enum'
import { cn } from '@/lib/utils'
import { formatMessageTime } from '@/utils/date'
import { formatFileSize } from '@/utils/file-size'
import { Archive, Image as ImageIcon, Play } from 'lucide-react'
import type { MessageSearchResponse } from '../../../../features/search/messages/schemas/message-search.schema'
import { useChatText } from '../../i18n/use-chat-text'

interface MessageResultCardProps {
  msg: MessageSearchResponse
  onClick?: () => void
}

export function MessageResultCard({ msg, onClick }: MessageResultCardProps) {
  const { i18n } = useChatText()
  const type = msg.type?.toUpperCase()
  const isImage = type === MessageType.Image
  const isVideo = type === MessageType.Video
  const isFile = type === MessageType.File || (msg.hasAttachment && !isImage && !isVideo)

  return (
    <div
      key={msg.messageId}
      onClick={onClick}
      className='flex items-start gap-3 p-3 hover:bg-(--layer-background-hover) cursor-pointer transition-colors border-b border-(--divider) last:border-none group'
    >
      {!isFile && (
        <UserAvatar
          name={msg.senderName || 'User'}
          src={msg.senderAvatar || undefined}
          className='w-10 h-10 shrink-0 mt-0.5'
        />
      )}
      <div className='flex-1 min-w-0'>
        {!isFile && (
          <div className='flex items-center justify-between gap-2 mb-1'>
            <span className='text-[12px] text-text-secondary truncate'>{msg.senderName || 'User'}</span>
            <span className='text-[11px] text-text-secondary whitespace-nowrap shrink-0'>
              {msg.createdAt && formatMessageTime(msg.createdAt, i18n.language)}
            </span>
          </div>
        )}
        <div className='text-[13px] line-clamp-2 leading-snug break-words'>{renderMessageContent(msg, i18n.language)}</div>
      </div>
    </div>
  )
}

function renderMessageContent(msg: MessageSearchResponse, lang: string) {
  const contentElement = msg.displayHighlights ? (
    <span dangerouslySetInnerHTML={{ __html: msg.displayHighlights }} />
  ) : (
    <span>{msg.displayContent || ''}</span>
  )

  const type = msg.type?.toUpperCase()
  const isImage = type === MessageType.Image
  const isVideo = type === MessageType.Video
  const isFile = type === MessageType.File || (msg.hasAttachment && !isImage && !isVideo)

  if (isImage || isVideo) {
    return (
      <div className='flex items-center gap-2 mt-1'>
        <div className='w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0 relative overflow-hidden border border-border/50'>
          {isVideo && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/20 z-10'>
              <Play className='w-4 h-4 text-white fill-white' />
            </div>
          )}
          <ImageIcon className='w-5 h-5 opacity-20' />
        </div>
        <div className='truncate flex-1 min-w-0 text-[13px]'>{contentElement}</div>
      </div>
    )
  }

  if (isFile) {
    const fileName = msg.displayContent || 'File'
    const ext = fileName.split('.').pop()?.toUpperCase() || ''

    const getFileStyle = (extension: string) => {
      if (['PDF'].includes(extension)) return { bg: 'bg-red-500', label: 'PDF' }
      if (['DOC', 'DOCX'].includes(extension)) return { bg: 'bg-blue-600', label: 'WORD' }
      if (['XLS', 'XLSX'].includes(extension)) return { bg: 'bg-green-600', label: 'EXCEL' }
      if (['PPT', 'PPTX'].includes(extension)) return { bg: 'bg-orange-500', label: 'PPT' }
      if (['ZIP', 'RAR', '7Z'].includes(extension)) return { bg: 'bg-purple-600', label: extension }
      if (['M4A', 'MP3', 'WAV', 'OGG'].includes(ext)) return { bg: 'bg-indigo-600', label: 'AUDIO' }
      if (['MP4', 'MOV', 'AVI', 'MKV'].includes(ext)) return { bg: 'bg-indigo-600', label: 'VIDEO' }
      return { bg: 'bg-primary/80', label: extension || 'FILE' }
    }

    const { bg, label } = getFileStyle(ext)

    return (
      <div className='flex items-start gap-4 mt-1 group/file'>
        <div className={cn('w-10 h-10 shrink-0 rounded flex items-center justify-center text-white', bg)}>
          {['ZIP', 'RAR', '7Z'].includes(ext) ? (
            <Archive size={18} className='text-white' />
          ) : (
            <span className='text-[9px] font-bold tracking-tight leading-none text-center px-0.5'>
              {label.slice(0, 5)}
            </span>
          )}
        </div>
        <div className='flex-1 min-w-0 flex flex-col justify-center h-10'>
          <div className='flex items-center justify-between gap-2'>
            <p className='text-[0.9375rem] text-text-primary font-semibold truncate'>{contentElement}</p>
            <span className='text-[11px] text-text-secondary whitespace-nowrap shrink-0 font-normal opacity-80'>
              {msg.createdAt && formatMessageTime(msg.createdAt, lang)}
            </span>
          </div>
          <div className='text-[0.8125rem] text-text-secondary truncate mt-0.5'>
            {msg.size ? formatFileSize(msg.size).replace(' ', '') : ''}
            {msg.senderName ? ` - ${msg.senderName}` : ''}
          </div>
        </div>
      </div>
    )
  }

  return contentElement
}

export function MessageResultSkeleton() {
  return (
    <div className='flex items-start gap-3 p-3 border-b border-(--divider) last:border-none'>
      <Skeleton className='w-10 h-10 rounded-full shrink-0 mt-0.5' />
      <div className='flex-1 min-w-0 space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-2 w-12' />
        </div>
        <div className='space-y-1.5'>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-4/5' />
        </div>
      </div>
    </div>
  )
}
