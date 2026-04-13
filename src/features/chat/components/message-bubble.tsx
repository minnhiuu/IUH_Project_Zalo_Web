import { cn } from '@/lib/utils'
import type { ConversationResponse, ConversationMemberResponse, MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { Quote, Forward, MoreHorizontal, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useChatContext } from '../context/chat-context'
import { MessageStatus, MessageType } from '@/constants/enum'
import { SystemMessage } from '../utils/system-message'
import { CallMessage } from './call-message'
import { UserAvatar } from '@/components/common/user-avatar'
import { MessageSenderAvatar } from './message-sender-avatar'
import { MessageIconButton } from './message-icon-button'
import { MessageMoreMenu } from './message-more-menu'
import { JoinLinkCard } from './join-link-card'

export function MessageBubble({
  message,
  isOwn,
  isFirst = true,
  isLast = true,
  isNewest = false,
  conversation,
  onReply,
  onForward,
  onAvatarClick,
  onRecall
}: {
  message: MessageResponse
  isOwn: boolean
  isFirst?: boolean
  isLast?: boolean
  isNewest?: boolean
  conversation?: ConversationResponse
  onReply?: () => void
  onForward?: () => void
  onAvatarClick?: (userId: string) => void
  onRecall?: (receiverId: string) => void
}) {
  const { text } = useChatText()
  const { deleteMessageForMe } = useChatContext()
  const mb = text.messageBubble

  const isRevoked = message.status === MessageStatus.REVOKED
  const conversationId = message.conversationId

  const isJoinLink = message.type === MessageType.Link && !!message.linkPreview

  const senderMember = conversation?.members?.find((m) => m.userId === message.senderId)
  const senderRole = senderMember?.role?.toUpperCase()
  const isAdminOrOwner = senderRole === 'ADMIN' || senderRole === 'OWNER'
  const isOwner = senderRole === 'OWNER'
  const highlightEnabled = conversation?.isGroup && conversation?.settings?.highlightAdminMessages && isAdminOrOwner
  const isGroup = conversation?.isGroup
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [isLikeHovered, setIsLikeHovered] = useState(false)

  if (message.type === MessageType.System) {
    return <SystemMessage message={message} conversation={conversation} />
  }
  if (message.type === MessageType.Call) {
    return <CallMessage message={message} isOwn={isOwn} onRecall={onRecall} />
  }
  return (
    <div
      className={cn(
        'group/message-row flex w-full px-2 gap-2',
        isOwn ? 'justify-end' : 'justify-start',
        isFirst ? 'mt-4' : 'mt-1'
      )}
    >
      {!isOwn && (
        <div className='w-10 shrink-0 flex items-end'>
          {isLast ? (
            <MessageSenderAvatar
              src={message.senderAvatar}
              name={message.senderName || text.user}
              isGroup={isGroup}
              isAdminOrOwner={isAdminOrOwner}
              isOwner={isOwner}
              onClick={() => message.senderId && onAvatarClick?.(message.senderId)}
            />
          ) : (
            <div className='w-10 h-10' />
          )}
        </div>
      )}

      <div className={cn('flex flex-col items-end', isOwn ? 'items-end' : 'items-start')}>
        <div className={cn('flex items-end gap-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <div
            className={cn(
              'p-3 max-w-md wrap-break-word text-[15px] shadow-sm flex flex-col relative rounded-lg',
              isOwn ? 'bg-blue-message text-black dark:text-primary-foreground' : 'bg-white-message text-foreground',
              isRevoked && 'pointer-events-none select-none opacity-80',
              highlightEnabled && 'border border-border-highlight'
            )}
          >
            {isGroup && !isOwn && isFirst && (
              <span className='text-[11px] font-medium text-text-secondary mb-1 truncate max-w-md'>
                {message.senderName || text.user}
              </span>
            )}
            {message.isForwarded && (
              <div className='flex items-center space-x-1 text-[11px] text-muted-foreground mb-1 font-medium opacity-70'>
                <Forward size={12} />
                <span>{mb.forwarded}</span>
              </div>
            )}

            {message.replyTo && (
              <div className='mb-1.5 px-3 py-1.5 border-l-2 border-[#1972F5] bg-[#CDE2FF]/50 rounded-sm select-none'>
                <div className='font-semibold text-[#0068FF] text-[13px]'>{message.replyTo.senderName}</div>
                <div className='text-[13px] text-black/70 truncate'>
                  {message.replyTo.type === 'IMAGE'
                    ? mb.image
                    : message.replyTo.type === 'FILE'
                      ? mb.file
                      : message.replyTo.content}
                </div>
              </div>
            )}

            <span>
              {isRevoked ? (
                <span className='italic text-muted-foreground/60'>{mb.revoked}</span>
              ) : isJoinLink ? (
                <JoinLinkCard
                  token={message.linkPreview!.token}
                  url={message.linkPreview!.url}
                  cachedPreview={message.linkPreview!}
                />
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

            {!isRevoked && (
              <div
                className={cn(
                  'absolute -bottom-2 right-0.5 z-10 group/like cursor-pointer',
                  isOwn && 'hidden group-hover/message-row:flex'
                )}
                onMouseEnter={() => setIsLikeHovered(true)}
                onMouseLeave={() => setIsLikeHovered(false)}
              >
                {/* Reaction Picker Popover */}
                <div
                  className={cn(
                    'absolute bottom-full mb-1.5 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-border rounded-full shadow-2xl px-3 py-2 opacity-0 pointer-events-none group-hover/like:opacity-100 group-hover/like:pointer-events-auto flex items-center gap-2 transition-all duration-200 animate-in fade-in zoom-in-95 after:content-[""] after:absolute after:top-full after:left-0 after:right-0 after:h-8',
                    isOwn ? 'right-0' : 'left-0'
                  )}
                >
                  {['👍', '❤️', '🤣', '😮', '😢', '😡'].map((emoji) => (
                    <button
                      key={emoji}
                      type='button'
                      className='leading-none hover:scale-125 transition-transform focus:outline-none'
                      style={{ cursor: 'pointer', fontSize: '20px' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <MessageIconButton
                  className='h-7 w-7 bg-background border-border/80 text-icon-secondary hover:text-icon-secondary hover:bg-background cursor-pointer!'
                  aria-label={mb.like}
                  icon={<ThumbsUp className='cursor-pointer' />}
                  iconSize='md'
                  style={{ cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {!isRevoked && (
            <div
              className={cn(
                'items-center gap-1 mb-2',
                isLikeHovered ? 'hidden' : isMoreMenuOpen ? 'flex' : 'hidden group-hover/message-row:flex'
              )}
            >
              <MessageIconButton
                onClick={onReply}
                title={mb.reply}
                icon={<Quote />}
                className='text-icon-secondary hover:text-primary'
              />
              <MessageIconButton
                onClick={onForward}
                title={mb.forward}
                icon={<Forward />}
                className='text-icon-secondary hover:text-primary'
              />

              <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <MessageIconButton
                    title={mb.more}
                    icon={<MoreHorizontal />}
                    className='text-icon-secondary hover:text-primary'
                  />
                </DropdownMenuTrigger>
                <MessageMoreMenu
                  side={isOwn ? 'left' : 'right'}
                  text={mb}
                  messageContent={message.content || ''}
                  onDeleteForMe={() => conversationId && deleteMessageForMe(message.id, conversationId)}
                />
              </DropdownMenu>
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
                                // title={`Đã xem bởi ${reader.fullName}`}
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
