import { cn } from '@/lib/utils'
import type { ConversationResponse, ConversationMemberResponse, MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { Reply, Forward, MoreHorizontal, Trash2, History, Share2, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useChatContext } from '../context/chat-context'
import { MessageStatus, MessageType } from '@/constants/enum'
import { SystemMessage } from '../utils/system-message'
import { UserAvatar } from '@/components/common/user-avatar'

export function MessageBubble({
  message,
  isOwn,
  isFirst = true,
  isLast = true,
  isNewest = false,
  conversation,
  onReply,
  onForward
}: {
  message: MessageResponse
  isOwn: boolean
  isFirst?: boolean
  isLast?: boolean
  isNewest?: boolean
  conversation?: ConversationResponse
  onReply?: () => void
  onForward?: () => void
}) {
  const { text } = useChatText()
  const { revokeMessage, deleteMessageForMe } = useChatContext()
  const isRevoked = message.status === MessageStatus.REVOKED
  const conversationId = message.conversationId

  if (message.type === MessageType.System) {
    return <SystemMessage message={message} conversation={conversation} />
  }
  return (
    <div className={cn('flex w-full px-2 gap-2', isOwn ? 'justify-end' : 'justify-start', isFirst ? 'mt-4' : 'mt-1')}>
      {!isOwn && (
        <div className='w-8 shrink-0 flex items-end'>
          {isLast ? (
            <UserAvatar
              src={message.senderAvatar}
              name={message.senderName || 'User'}
              className='w-8 h-8 border border-black/5'
            />
          ) : (
            <div className='w-8 h-8' />
          )}
        </div>
      )}

      <div className={cn('flex flex-col items-end', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2 max-w-md wrap-break-word text-[15px] shadow-sm flex flex-col relative group',
            isOwn
              ? 'bg-[#e5efff] text-black dark:bg-primary dark:text-primary-foreground'
              : 'bg-white dark:bg-zinc-900 text-foreground',
            // Logic bo góc Zalo
            isOwn
              ? cn('rounded-2xl', !isFirst && 'rounded-tr-md', !isLast && 'rounded-br-md')
              : cn('rounded-2xl', !isFirst && 'rounded-tl-md', !isLast && 'rounded-bl-md'),
            isRevoked && 'pointer-events-none select-none opacity-80'
          )}
        >
          {!isRevoked && (
            <div
              className={cn(
                'absolute bottom-0 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 z-20 pointer-events-none group-hover:pointer-events-auto',
                isOwn ? 'right-full pr-2' : 'left-full pl-2'
              )}
            >
              <button
                onClick={onReply}
                className='p-1.5 hover:bg-white/80 dark:hover:bg-zinc-800 rounded-full text-muted-foreground shadow-sm border bg-background/50 backdrop-blur-sm transition-all hover:scale-110'
                title='Trả lời'
              >
                <Reply size={16} />
              </button>
              <button
                onClick={onForward}
                className='p-1.5 hover:bg-white/80 dark:hover:bg-zinc-800 rounded-full text-muted-foreground shadow-sm border bg-background/50 backdrop-blur-sm transition-all hover:scale-110'
                title='Chuyển tiếp'
              >
                <Forward size={16} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='p-1.5 hover:bg-white/80 dark:hover:bg-zinc-800 rounded-full text-muted-foreground shadow-sm border bg-background/50 backdrop-blur-sm transition-all hover:scale-110'
                    title='Thêm'
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? 'end' : 'start'} className='w-48'>
                  <DropdownMenuItem onClick={onReply} className='gap-2'>
                    <Reply size={14} className='text-muted-foreground' />
                    <span>Trả lời</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onForward} className='gap-2'>
                    <Share2 size={14} className='text-muted-foreground' />
                    <span>Chia sẻ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(message.content || '')}
                    className='gap-2'
                  >
                    <Copy size={14} className='text-muted-foreground' />
                    <span>Sao chép</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {isOwn && (
                    <DropdownMenuItem
                      onClick={() => conversationId && revokeMessage(message.id, conversationId)}
                      className='gap-2 text-orange-500 focus:text-orange-500 focus:bg-orange-50'
                    >
                      <History size={14} />
                      <span>Thu hồi</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => conversationId && deleteMessageForMe(message.id, conversationId)}
                    className='gap-2 text-destructive focus:text-destructive focus:bg-destructive/10'
                  >
                    <Trash2 size={14} />
                    <span>Xóa chỉ ở phía tôi</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {message.isForwarded && (
            <div className='flex items-center space-x-1 text-[11px] text-muted-foreground mb-1 font-medium opacity-70'>
              <Forward size={12} />
              <span>Đã chuyển tiếp</span>
            </div>
          )}

          {message.replyTo && (
            <div className='mb-1.5 px-3 py-1.5 border-l-2 border-[#1972F5] bg-[#CDE2FF]/50 rounded-sm select-none'>
              <div className='font-semibold text-[#0068FF] text-[13px]'>{message.replyTo.senderName}</div>
              <div className='text-[13px] text-black/70 truncate'>
                {message.replyTo.type === 'IMAGE'
                  ? '📷 Hình ảnh'
                  : message.replyTo.type === 'FILE'
                    ? '📁 Tệp tin'
                    : message.replyTo.content}
              </div>
            </div>
          )}

          <span>
            {isRevoked ? (
              <span className='italic text-muted-foreground/60'>Tin nhắn đã được thu hồi</span>
            ) : (
              message.content
            )}
          </span>

          {isLast && (
            <div
              className={cn(
                'flex items-center mt-1 font-medium self-start',
                isOwn ? 'text-black/50 dark:text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              <span className='text-[11px]'>
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
            </div>
          )}
        </div>

        {isOwn && (
          <div className='flex flex-col items-end mt-1'>
            {(() => {
              const readers =
                conversation?.members?.filter((m: ConversationMemberResponse) => m.lastReadMessageId === message.id) ||
                []
              const hasReaders = readers.length > 0

              return (
                <>
                  {!hasReaders && isNewest && (
                    <span className='text-[11px] text-muted-foreground px-1 select-none'>
                      {message.id.startsWith('temp-') ? text.status.sending : text.status.sent}
                    </span>
                  )}

                  {/* Read Receipts Avatars */}
                  {hasReaders && (
                    <div className='flex -space-x-1 items-center mt-1 pr-1'>
                      {(() => {
                        const MAX_AVATARS = 3
                        const visibleReaders = readers.slice(0, MAX_AVATARS)
                        const extraCount = readers.length - MAX_AVATARS

                        return (
                          <>
                            {visibleReaders.map((reader: ConversationMemberResponse) => (
                              <UserAvatar
                                key={reader.userId}
                                src={reader.avatar}
                                name={reader.fullName || 'User'}
                                className='w-3 h-3 border border-background shadow-sm'
                                fallbackClassName='text-[6px]'
                                title={`Đã xem bởi ${reader.fullName}`}
                              />
                            ))}
                            {extraCount > 0 && (
                              <div className='w-3 h-3 rounded-full bg-muted border border-background flex items-center justify-center'>
                                <span className='text-[6px] font-bold'>+{extraCount}</span>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
