import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from '@/components/common/group-avatar'
import { formatMessageTime } from '@/utils/date'
import { formatFileSize } from '@/utils/file-size'
import { cn } from '@/lib/utils'
import type { MessageSearchResponse } from '@/features/search/messages/schemas/message-search.schema'
import { Archive, Image, Search, Download, Forward, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useMessageQuery } from '@/features/chat/queries/use-queries'
import { ForwardDialog } from '@/features/chat/components/forward-dialog'
import { useSendMessageMutation } from '@/features/chat/queries/use-mutations'
import { useChatText } from '@/features/chat/i18n/use-chat-text'
import { FilePreviewModal } from '@/features/chat/components/message-file-content'

interface MessageResultCardProps {
  msg: MessageSearchResponse
  variant?: 'message' | 'file'
  isActive?: boolean
  onClick?: () => void
  showSenderOnly?: boolean
}

export function MessageResultCard({
  msg,
  variant = 'message',
  isActive,
  onClick,
  showSenderOnly = false
}: MessageResultCardProps) {
  const { i18n } = useChatText()
  const senderName = msg.senderName || 'User'
  const [fetchDetails, setFetchDetails] = useState(false)
  const [forwardOpen, setForwardOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const { data: fullMsg } = useMessageQuery(msg.messageId, fetchDetails)
  const { mutate: sendMessage } = useSendMessageMutation()

  const handleForward = (selectedConvIds: string[], description?: string) => {
    if (!fullMsg) return
    selectedConvIds.forEach((convId) => {
      sendMessage({
        conversationId: convId,
        content: fullMsg.content || '',
        attachments: fullMsg.attachments?.map((a) => ({
          key: a.key,
          url: a.url,
          fileName: a.fileName,
          originalFileName: a.originalFileName,
          contentType: a.contentType,
          size: a.size
        })),
        isForwarded: true
      })
      if (description) {
        sendMessage({
          conversationId: convId,
          content: description
        })
      }
    })
    setForwardOpen(false)
  }

  const containerClass = cn(
    'grid grid-cols-[auto_1fr_auto] grid-rows-[max-content_1fr] pt-[14px] px-4 min-h-[68px] max-h-[88px] gap-x-[10px] gap-y-[2px] cursor-pointer transition-[background-color] duration-75 box-border relative group',
    isActive ? 'bg-(--layer-background-selected)' : 'hover:bg-(--layer-background-subtle)'
  )

  if (variant === 'file') {
    const fileName = msg.displayContent || 'File'
    const ext = fileName.split('.').pop()?.toUpperCase() || ''

    const getFileStyle = (extension: string) => {
      if (['PDF'].includes(extension)) return { bg: 'bg-red-500', label: 'PDF', isImg: false }
      if (['DOC', 'DOCX'].includes(extension)) return { bg: 'bg-blue-600', label: 'WORD', isImg: false }
      if (['XLS', 'XLSX'].includes(extension)) return { bg: 'bg-green-600', label: 'EXCEL', isImg: false }
      if (['PPT', 'PPTX'].includes(extension)) return { bg: 'bg-orange-500', label: 'PPT', isImg: false }
      if (['ZIP', 'RAR', '7Z'].includes(extension))
        return { bg: 'bg-purple-600', label: extension.slice(0, 3), isImg: false }
      if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(extension))
        return { bg: 'bg-teal-500', label: 'IMG', isImg: true }
      return { bg: 'bg-primary', label: extension.slice(0, 3) || 'FILE', isImg: false }
    }

    const { bg, label, isImg } = getFileStyle(ext)

    return (
      <div key={msg.messageId} onClick={onClick} className={containerClass}>
        {/* Col 1, Span 2 Rows - File Icon */}
        <div className='row-span-2 pt-0.5'>
          <div
            className={cn(
              'w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white relative overflow-hidden',
              bg
            )}
          >
            {['ZIP', 'RAR', '7Z'].includes(ext) ? (
              <Archive size={20} className='text-white' />
            ) : isImg ? (
              <Image size={22} className='text-white' />
            ) : (
              <span className='text-[10px] font-bold tracking-tight leading-none text-center px-0.5'>{label}</span>
            )}
          </div>
        </div>

        {/* Col 2, Row 1 - Filename */}
        <div className='text-[15px] font-medium text-text-primary truncate leading-tight pt-0.5'>
          {msg.displayHighlights ? (
            <span
              className='[&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold'
              dangerouslySetInnerHTML={{ __html: msg.displayHighlights }}
            />
          ) : (
            <span>{fileName}</span>
          )}
        </div>

        {/* Col 3, Row 1 - Date */}
        <span className='text-[12px] text-text-secondary whitespace-nowrap pt-1'>
          {msg.createdAt && formatMessageTime(msg.createdAt, i18n.language)}
        </span>

        {/* Col 2, Row 2 - Metadata (Size - Sender) */}
        <div className='flex items-start gap-1.5 col-start-2 pb-3'>
          <span className='text-[13px] text-text-secondary truncate'>
            {msg.size ? formatFileSize(msg.size).replace(' ', '') : '0 KB'}
          </span>
          <span className='text-[13px] text-text-secondary shrink-0'>-</span>
          <span className='text-[13px] text-text-secondary truncate'>{senderName}</span>
        </div>

        {/* Action Icons on Hover */}
        <div
          className='absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5 bg-white dark:bg-zinc-800 shadow-md border border-border/50 rounded-lg p-1 z-10'
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className='p-1.5 hover:bg-muted rounded-md transition-colors text-text-secondary hover:text-primary'
            title='Preview'
            onClick={() => {
              setFetchDetails(true)
              setPreviewOpen(true)
            }}
          >
            <Search size={16} />
          </button>
          <button
            className='p-1.5 hover:bg-muted rounded-md transition-colors text-text-secondary hover:text-primary'
            title='Download'
            onClick={() => {
              setFetchDetails(true)
              if (fullMsg?.attachments?.[0]?.url) {
                const link = document.createElement('a')
                link.href = fullMsg.attachments[0].url
                link.download = fullMsg.attachments[0].originalFileName || 'file'
                link.click()
              }
            }}
          >
            <Download size={16} />
          </button>
          <button
            className='p-1.5 hover:bg-muted rounded-md transition-colors text-text-secondary hover:text-primary'
            title='Forward'
            onClick={() => {
              setFetchDetails(true)
              setForwardOpen(true)
            }}
          >
            <Forward size={16} />
          </button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className='p-1.5 hover:bg-muted rounded-md transition-colors text-text-secondary hover:text-primary outline-none'>
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' sideOffset={5} usePortal={false} className='w-40'>
              <DropdownMenuItem
                onClick={() => {
                  setFetchDetails(true)
                  setForwardOpen(true)
                }}
              >
                Chuyển tiếp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClick}>
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        {forwardOpen && fullMsg && (
          <ForwardDialog
            open={forwardOpen}
            onClose={() => setForwardOpen(false)}
            message={fullMsg}
            onConfirm={handleForward}
          />
        )}

        {previewOpen && fullMsg?.attachments?.[0]?.url && (
          <FilePreviewModal
            url={`https://docs.google.com/viewer?url=${encodeURIComponent(fullMsg.attachments[0].url)}&embedded=true`}
            fileName={fullMsg.attachments[0].originalFileName || 'File'}
            fileUrl={fullMsg.attachments[0].url}
            fileSize={fullMsg.attachments[0].size}
            onClose={() => setPreviewOpen(false)}
          />
        )}

        {/* Divider line */}
        {!isActive && (
          <div className='absolute bottom-0 left-[70px] right-0 h-[1px] bg-(--divider) group-last:hidden' />
        )}
      </div>
    )
  }

  return (
    <div key={msg.messageId} onClick={onClick} className={containerClass}>
      {/* Col 1, Span 2 Rows */}
      <div className='row-span-2'>
        {msg.isGroup && !msg.conversationAvatar && !showSenderOnly ? (
          <GroupAvatar
            avatars={msg.participantAvatars || []}
            names={msg.participantNames || []}
            count={msg.participantNames?.length || 0}
            size='lg'
          />
        ) : (
          <UserAvatar
            name={showSenderOnly ? senderName : msg.conversationName || senderName}
            src={
              showSenderOnly ? msg.senderAvatar || undefined : msg.conversationAvatar || msg.senderAvatar || undefined
            }
            className='w-12 h-12 shrink-0'
          />
        )}
      </div>

      {/* Col 2, Row 1 */}
      <div className='text-[15px] font-medium text-text-primary truncate leading-tight pt-0.5'>
        {showSenderOnly ? senderName : msg.conversationName || senderName}
      </div>

      {/* Col 3, Row 1 */}
      <span className='text-[12px] text-text-secondary whitespace-nowrap pt-1'>
        {msg.createdAt && formatMessageTime(msg.createdAt, i18n.language)}
      </span>

      {/* Col 2, Row 2 */}
      <div className='col-start-2 text-[14px] text-text-secondary truncate leading-tight pb-3'>
        {!showSenderOnly && <span className='mr-1'>{senderName}:</span>}
        {msg.displayHighlights ? (
          <span
            className='[&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold'
            dangerouslySetInnerHTML={{ __html: msg.displayHighlights }}
          />
        ) : (
          <span>{msg.displayContent}</span>
        )}
      </div>

      {/* Divider line */}
      {!isActive && <div className='absolute bottom-0 left-[76px] right-0 h-[1px] bg-(--divider) group-last:hidden' />}
    </div>
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
