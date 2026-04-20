import { cn } from '@/lib/utils'
import type { ConversationResponse, ConversationMemberResponse, MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { Quote, Forward, MoreHorizontal } from 'lucide-react'
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
import { MessageInfoDialog } from './message-info-dialog'
import { AdminDeleteMessageDialog } from './admin-delete-message-dialog'
import { JoinLinkCard } from './join-link-card'
import { useRevokeMessageMutation, usePinMessageMutation } from '../queries/use-mutations'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { parseMentionsForRender, stripMentionsForPreview } from '../utils/mention'
import { useSeenMembersQuery } from '../queries/use-queries'
import { MessageMediaContent } from './message-media-content'
import { MessageFileContent } from './message-file-content'
import { MessageReactionPicker } from './message-reaction-picker'
import { ReactionModal } from './reaction-modal'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { PageResponse } from '@/shared/api'
import { chatKeys } from '../queries/keys'

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
  onRecall,
  onScrollToMessage
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
  onScrollToMessage?: (messageId: string) => void
}) {
  const { text } = useChatText()
  const { deleteMessageForMe } = useChatContext()
  const { mutate: revokeMessage } = useRevokeMessageMutation()
  const { user } = useAuth()
  const { mutate: pinMessageMutate } = usePinMessageMutation()
  const queryClient = useQueryClient()
  const mb = text.messageBubble

  const isRevoked = message.status === MessageStatus.REVOKED
  const isDeletedByAdmin = message.status === MessageStatus.DELETED_BY_ADMIN
  const isUnavailable = isRevoked || isDeletedByAdmin
  const conversationId = message.conversationId

  const isJoinLink = message.type === MessageType.Link && !!message.linkPreview

  const senderMember = conversation?.members?.find((m) => m.userId === message.senderId)
  const senderRole = senderMember?.role?.toUpperCase()
  const isAdminOrOwner = senderRole === 'ADMIN' || senderRole === 'OWNER'
  const isOwner = senderRole === 'OWNER'
  const highlightEnabled = conversation?.isGroup && conversation?.settings?.highlightAdminMessages && isAdminOrOwner
  const isGroup = conversation?.isGroup

  const currentUserMember = conversation?.members?.find((m) => m.userId === String(user?.id))
  const currentUserRole = currentUserMember?.role?.toUpperCase()
  const currentUserIsOwner = currentUserRole === 'OWNER'
  const currentUserIsAdmin = currentUserRole === 'ADMIN'
  const canAdminDelete = !!isGroup && !isOwn && (currentUserIsOwner || currentUserIsAdmin)
  // Admin can delete for everyone unless the sender is the owner
  const canDeleteMsgForAll = currentUserIsOwner || (currentUserIsAdmin && senderRole !== 'OWNER')

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [isLikeHovered, setIsLikeHovered] = useState(false)
  const [reactionModalOpen, setReactionModalOpen] = useState(false)

  const [seenDialogOpen, setSeenDialogOpen] = useState(false)

  const [showInlineSeen, setShowInlineSeen] = useState(false)
  const [adminDeleteOpen, setAdminDeleteOpen] = useState(false)

  const isPreviousOwnGroup = isOwn && !isNewest && !!isGroup && !isUnavailable
  const { data: seenMembers, isLoading: seenLoading } = useSeenMembersQuery(
    conversationId!,
    message.id,
    (seenDialogOpen || showInlineSeen) && isPreviousOwnGroup
  )

  const [quickReactEmoji, setQuickReactEmoji] = useState<string | null>(null)

  // Tra cứu attachment URL của tin gốc từ cache (dùng cho reply preview)
  const getReplyAttachmentUrl = (replyMessageId: string): string | null => {
    if (!conversationId) return null
    const cached = queryClient.getQueryData<InfiniteData<PageResponse<MessageResponse>>>(
      chatKeys.messages(conversationId)
    )
    if (!cached) return null
    for (const page of cached.pages) {
      const found = page.data.find((m) => m.id === replyMessageId)
      if (found) return found.attachments?.[0]?.url ?? null
    }
    return null
  }

  const isImageMessage = !isUnavailable && (message.type === MessageType.Image || message.type === MessageType.Video)
  const hasReactions = !isUnavailable && !!message.reactions && Object.keys(message.reactions).length > 0

  if (message.type === MessageType.System) {
    return <SystemMessage message={message} conversation={conversation} />
  }
  if (message.type === MessageType.Call) {
    return <CallMessage message={message} isOwn={isOwn} onRecall={onRecall} />
  }
  return (
    <div
      className={cn(
        'group flex w-full px-2 gap-2',
        isOwn ? 'justify-end' : 'justify-start',
        isFirst ? 'mt-4' : 'mt-1',
        hasReactions && 'mb-2'
      )}
    >
      {!isOwn && (
        <div className='w-10 shrink-0 flex items-start'>
          {isFirst ? (
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
              'max-w-md wrap-break-word text-[15px] shadow-sm flex flex-col relative rounded-lg',
              isImageMessage ? 'p-1' : isUnavailable ? 'px-3 py-1.5' : 'p-5',
              isOwn && !isUnavailable
                ? 'bg-blue-message text-black dark:text-primary-foreground'
                : 'bg-white-message text-foreground',
              isUnavailable && 'pointer-events-none select-none border border-black/5 shadow-none',
              highlightEnabled && 'border border-border-highlight',
              isPreviousOwnGroup && 'cursor-pointer'
            )}
            onClick={isPreviousOwnGroup ? () => setShowInlineSeen((v) => !v) : undefined}
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

            {message.replyTo && !isUnavailable && (
              <div
                className='mb-1.5 px-3 py-1.5 border-l-2 border-[#1972F5] bg-[#CDE2FF]/50 rounded-sm select-none cursor-pointer hover:bg-[#CDE2FF]/80 transition-colors'
                onClick={() => onScrollToMessage?.(message.replyTo!.messageId)}
              >
                <div className='font-semibold text-[#0068FF] text-[13px]'>{message.replyTo.senderName}</div>
                {message.replyTo.type === 'IMAGE' || message.replyTo.type === 'VIDEO' ? (
                  (() => {
                    // Ưu tiên: thumbnailUrl → content nếu là URL → lookup attachment từ cache (ảnh kèm caption)
                    const mediaSrc =
                      message.replyTo.thumbnailUrl ||
                      (message.replyTo.content?.startsWith('http') ? message.replyTo.content : null) ||
                      getReplyAttachmentUrl(message.replyTo.messageId)
                    return (
                      <div className='flex items-center gap-2 mt-0.5'>
                        {mediaSrc && (
                          <div className='relative w-10 h-10 rounded overflow-hidden shrink-0 bg-muted'>
                            {message.replyTo.type === 'VIDEO' ? (
                              <video src={mediaSrc} className='w-full h-full object-cover' preload='metadata' muted />
                            ) : (
                              <img
                                src={mediaSrc}
                                alt=''
                                className='w-full h-full object-cover'
                                onError={(e) => {
                                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            )}
                            {message.replyTo.type === 'VIDEO' && (
                              <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                                <svg width='12' height='12' viewBox='0 0 24 24' fill='white'>
                                  <polygon points='5,3 19,12 5,21' />
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                        <span className='text-[13px] text-black/70'>
                          {message.replyTo.type === 'IMAGE' ? mb.image : '[Video]'}
                        </span>
                      </div>
                    )
                  })()
                ) : (
                  <div className='text-[13px] text-black/70 truncate'>
                    {message.replyTo.content === null ? (
                      <span className='italic'>{mb.replyUnavailable}</span>
                    ) : message.replyTo.type === 'FILE' ? (
                      mb.file
                    ) : (
                      stripMentionsForPreview(message.replyTo.content)
                    )}
                  </div>
                )}
              </div>
            )}

            <span>
              {isUnavailable ? (
                <span className='text-muted-foreground/50 font-normal'>
                  {isDeletedByAdmin
                    ? message.deletedByAdminId === String(user?.id)
                      ? mb.deletedByAdminSelf
                      : mb.deletedByAdmin(
                          conversation?.members?.find((m) => m.userId === message.deletedByAdminId)?.fullName ??
                            'Quản trị viên'
                        )
                    : isOwn
                      ? 'Bạn đã thu hồi tin nhắn'
                      : mb.revoked}
                </span>
              ) : isJoinLink ? (
                <JoinLinkCard
                  token={message.linkPreview!.token}
                  url={message.linkPreview!.url}
                  cachedPreview={message.linkPreview!}
                />
              ) : message.type === MessageType.Image || message.type === MessageType.Video ? (
                <>
                  <MessageMediaContent message={message} />
                  {!!message.content && !['[Hình ảnh]', '[IMAGE]', '[Video]', '[VIDEO]'].includes(message.content) && (
                    <div className='px-1 pt-1'>
                      {parseMentionsForRender(message.content).map(({ isMention, text, key }) =>
                        isMention ? (
                          <span key={key} className='text-[#005AE0] dark:text-[#3B82F6] cursor-pointer hover:underline'>
                            {text}
                          </span>
                        ) : (
                          <span key={key} className='whitespace-pre-wrap'>
                            {text}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </>
              ) : message.type === MessageType.File ? (
                <MessageFileContent message={message} />
              ) : (
                parseMentionsForRender(message.content).map(({ isMention, text, key }) =>
                  isMention ? (
                    <span key={key} className='text-[#005AE0] dark:text-[#3B82F6] cursor-pointer hover:underline'>
                      {text}
                    </span>
                  ) : (
                    <span key={key} className='whitespace-pre-wrap'>
                      {text}
                    </span>
                  )
                )
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

            {!isUnavailable && (
              <MessageReactionPicker
                message={message}
                quickReactEmoji={quickReactEmoji}
                setQuickReactEmoji={setQuickReactEmoji}
                conversationId={conversationId || undefined}
                isOwn={isOwn}
                onMouseEnter={() => setIsLikeHovered(true)}
                onMouseLeave={() => setIsLikeHovered(false)}
              />
            )}

            {/* â”€â”€ Reaction badge (inside bubble, Zalo-style overlay) â”€â”€ */}
            {hasReactions &&
              (() => {
                const entries = Object.entries(message.reactions!)
                const totalCount = entries.reduce((sum, [, ids]) => sum + ids.length, 0)
                const displayEmojis = [...new Set(entries.map(([e]) => e))].slice(0, 3)
                return (
                  <button
                    type='button'
                    onClick={() => setReactionModalOpen(true)}
                    className={cn(
                      'absolute z-20 flex items-center gap-0.5 rounded-full select-none cursor-pointer transition-opacity',
                      'right-8 -bottom-2 px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-border shadow-sm hover:bg-muted'
                    )}
                  >
                    {displayEmojis.map((emoji) => (
                      <span key={emoji} style={{ fontSize: '14px', lineHeight: 1 }}>
                        {emoji}
                      </span>
                    ))}
                    <span className='text-[12px] font-medium ml-0.5 text-muted-foreground'>{totalCount}</span>
                  </button>
                )
              })()}
          </div>

          {!isUnavailable && (
            <div className={cn('msg-actions', isLikeHovered ? 'is-hidden' : isMoreMenuOpen ? 'is-open' : '')}>
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
                  isOwn={isOwn}
                  onDeleteForMe={() => conversationId && deleteMessageForMe(message.id, conversationId)}
                  onPin={() => conversationId && pinMessageMutate({ conversationId, messageId: message.id })}
                  onRevoke={() => revokeMessage(message.id)}
                  onAdminDelete={canAdminDelete ? () => setAdminDeleteOpen(true) : undefined}
                />
              </DropdownMenu>
            </div>
          )}
        </div>

        <ReactionModal
          open={reactionModalOpen}
          onClose={() => setReactionModalOpen(false)}
          reactions={message.reactions || {}}
          members={conversation?.members}
          currentUser={user ? { id: user.id, fullName: user.fullName, avatar: user.avatar ?? undefined } : undefined}
        />

        {isOwn &&
          isNewest &&
          (() => {
            const readers =
              conversation?.members?.filter((m: ConversationMemberResponse) => m.lastReadMessageId === message.id) || []
            const hasReaders = readers.length > 0
            const MAX_AVATARS = 5
            const visibleReaders = readers.slice(0, MAX_AVATARS)
            const extraCount = readers.length - MAX_AVATARS
            return (
              <div className='flex flex-col items-end mt-1'>
                {!hasReaders && (
                  <span className='text-[11px] text-muted-foreground px-1 select-none'>
                    {message.id.startsWith('temp-') ? text.status.sending : text.status.sent}
                  </span>
                )}
                {hasReaders && (
                  <button
                    type='button'
                    onClick={() => setSeenDialogOpen(true)}
                    className='flex -space-x-1 items-center mt-1 pr-1 cursor-pointer'
                  >
                    {visibleReaders.map((reader: ConversationMemberResponse) => (
                      <UserAvatar
                        key={reader.userId}
                        src={reader.avatar}
                        name={reader.fullName || 'User'}
                        className='w-3 h-3 border border-background shadow-sm'
                        fallbackClassName='text-[6px]'
                      />
                    ))}
                    {extraCount > 0 && (
                      <div className='w-3 h-3 rounded-full bg-muted border border-background flex items-center justify-center'>
                        <span className='text-[6px] font-bold'>+{extraCount}</span>
                      </div>
                    )}
                  </button>
                )}
                {/* Dialog for newest own message */}
                <MessageInfoDialog
                  open={seenDialogOpen}
                  onOpenChange={setSeenDialogOpen}
                  message={message}
                  seenMembers={readers.map((r) => ({
                    userId: r.userId,
                    fullName: r.fullName || null,
                    avatar: r.avatar || null
                  }))}
                  loading={false}
                />
              </div>
            )
          })()}

        {isPreviousOwnGroup && showInlineSeen && (
          <div className='flex flex-col items-end mt-1'>
            {seenLoading ? (
              <span className='text-[11px] text-muted-foreground pr-1'>{text.loading}</span>
            ) : !seenMembers || seenMembers.length === 0 ? (
              <span className='text-[11px] text-muted-foreground pr-1'>{text['message-info-dialog'].noOneSeen}</span>
            ) : (
              <button
                type='button'
                onClick={() => setSeenDialogOpen(true)}
                className='flex -space-x-1 items-center mt-0.5 pr-1 cursor-pointer'
              >
                {seenMembers.slice(0, 5).map((m) => (
                  <UserAvatar
                    key={m.userId}
                    src={m.avatar}
                    name={m.fullName || 'User'}
                    className='w-3 h-3 border border-background shadow-sm'
                    fallbackClassName='text-[6px]'
                  />
                ))}
                {seenMembers.length > 5 && (
                  <div className='w-3 h-3 rounded-full bg-muted border border-background flex items-center justify-center'>
                    <span className='text-[6px] font-bold'>+{seenMembers.length - 5}</span>
                  </div>
                )}
              </button>
            )}

            <MessageInfoDialog
              open={seenDialogOpen}
              onOpenChange={setSeenDialogOpen}
              message={message}
              seenMembers={seenMembers ?? []}
              loading={seenLoading}
            />
          </div>
        )}

        {canAdminDelete && (
          <AdminDeleteMessageDialog
            open={adminDeleteOpen}
            onOpenChange={setAdminDeleteOpen}
            message={message}
            conversationId={conversationId}
            canDeleteMsgForAll={canDeleteMsgForAll}
          />
        )}
      </div>
    </div>
  )
}
