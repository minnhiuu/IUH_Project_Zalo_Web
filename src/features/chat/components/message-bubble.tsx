import { cn } from '@/lib/utils'
import type { ConversationResponse, ConversationMemberResponse, MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { Quote, Forward, MoreHorizontal, ThumbsUp, FileIcon, Download, X, Play } from 'lucide-react'
import { useState, useMemo } from 'react'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useChatContext } from '../context/chat-context'
import { MessageStatus, MessageType } from '@/constants/enum'
import { SystemMessage } from '../utils/system-message'
import { UserAvatar } from '@/components/common/user-avatar'
import { MessageSenderAvatar } from './message-sender-avatar'
import { MessageIconButton } from './message-icon-button'
import { MessageMoreMenu } from './message-more-menu'
import { JoinLinkCard } from './join-link-card'
import {
  useRevokeMessageMutation,
  useToggleReactionMutation,
  useRemoveAllMyReactionsMutation,
  usePinMessageMutation
} from '../queries/use-mutations'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { PageResponse } from '@/shared/api'
import { chatKeys } from '../queries/keys'
import { parseMentionsForRender, stripMentionsForPreview } from '../utils/mention'

export function MessageBubble({
  message,
  isOwn,
  isFirst = true,
  isLast = true,
  isNewest = false,
  conversation,
  onReply,
  onForward,
  onAvatarClick
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
}) {
  const { text } = useChatText()
  const { deleteMessageForMe } = useChatContext()
  const { mutate: revokeMessage } = useRevokeMessageMutation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { mutate: toggleReactionMutate } = useToggleReactionMutation()
  const { mutateAsync: removeAllMyReactionsAsync } = useRemoveAllMyReactionsMutation()
  const { mutate: pinMessageMutate } = usePinMessageMutation()
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
  const [reactionModalOpen, setReactionModalOpen] = useState(false)
  // Per-message quick react: show the last emoji the user reacted on THIS message, or 👍
  const quickReactEmoji = useMemo(() => {
    if (!user?.id || !message.reactions) return '👍'
    const uid = String(user.id)
    const myEmojis = Object.entries(message.reactions)
      .filter(([, uids]) => uids.map(String).includes(uid))
      .map(([e]) => e)
    return myEmojis.length > 0 ? myEmojis[myEmojis.length - 1] : '👍'
  }, [user?.id, message.reactions])

  const isImageMessage = !isRevoked && (message.type === MessageType.Image || message.type === MessageType.Video)
  const hasReactions = !isRevoked && !!message.reactions && Object.keys(message.reactions).length > 0

  if (message.type === MessageType.System) {
    return <SystemMessage message={message} conversation={conversation} />
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
              'max-w-md wrap-break-word text-[15px] shadow-sm flex flex-col relative rounded-lg',
              isImageMessage ? 'p-1' : 'p-5',
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
                  {message.replyTo.content === null ? (
                    <span className='italic opacity-60'>{mb.revoked}</span>
                  ) : message.replyTo.type === MessageType.Image ? (
                    mb.image
                  ) : message.replyTo.type === MessageType.File ? (
                    mb.file
                  ) : (
                    stripMentionsForPreview(message.replyTo.content)
                  )}
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
              ) : message.type === MessageType.Image || message.type === MessageType.Video ? (
                <MessageMediaContent message={message} />
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

            {!isRevoked && (
              <div
                className={cn('absolute -bottom-2 right-0.5 z-10 group/like cursor-pointer', 'hidden group-hover:flex')}
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
                      onClick={() => {
                        // Save as last used emoji
                        if (user?.id) {
                          localStorage.setItem(`chat_last_emoji_${user.id}`, emoji)
                        }
                        toggleReactionMutate({ messageId: message.id, emoji })
                        // Optimistic — always add (use X button to remove)
                        if (!conversationId || message.id.startsWith('temp-')) return
                        queryClient.setQueryData(
                          chatKeys.messages(conversationId),
                          (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                            if (!oldData) return oldData
                            return {
                              ...oldData,
                              pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                                ...page,
                                data: page.data.map((m: MessageResponse) => {
                                  if (m.id !== message.id) return m
                                  const reactions: Record<string, string[]> = JSON.parse(
                                    JSON.stringify(m.reactions || {})
                                  )
                                  const uid = user?.id || ''
                                  const users = reactions[emoji] || []
                                  reactions[emoji] = [...users, uid]
                                  return { ...m, reactions }
                                })
                              }))
                            }
                          }
                        )
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                  {/* X button — remove all my reactions */}
                  {user?.id &&
                    Object.entries(message.reactions || {}).some(([, uids]) =>
                      uids.map(String).includes(String(user.id))
                    ) && (
                      <button
                        type='button'
                        title='Xóa tất cả cảm xúc của bạn'
                        className='w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0'
                        onClick={async () => {
                          if (!conversationId || message.id.startsWith('temp-') || !user?.id) return
                          const uid = user.id
                          const myEmojis = Object.entries(message.reactions || {})
                            .filter(([, uids]) => uids.map(String).includes(String(uid)))
                            .map(([e]) => e)
                          if (myEmojis.length === 0) return
                          // Optimistic: strip current user from all emoji lists immediately
                          queryClient.setQueryData(
                            chatKeys.messages(conversationId),
                            (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                              if (!oldData) return oldData
                              return {
                                ...oldData,
                                pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                                  ...page,
                                  data: page.data.map((m: MessageResponse) => {
                                    if (m.id !== message.id) return m
                                    const reactions: Record<string, string[]> = {}
                                    for (const [e, uids] of Object.entries(m.reactions || {})) {
                                      const filtered = uids.filter((id) => String(id) !== String(uid))
                                      if (filtered.length > 0) reactions[e] = filtered
                                    }
                                    return { ...m, reactions: Object.keys(reactions).length ? reactions : undefined }
                                  })
                                }))
                              }
                            }
                          )
                          // Single API call to remove all my reactions
                          await removeAllMyReactionsAsync({ messageId: message.id }).catch(() => {})
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                </div>

                <MessageIconButton
                  className='h-7 w-7 bg-background border-border/80 text-icon-secondary hover:text-icon-secondary hover:bg-background cursor-pointer!'
                  aria-label={mb.like}
                  icon={
                    quickReactEmoji !== '👍' ? (
                      <span style={{ fontSize: '16px', lineHeight: 1 }}>{quickReactEmoji}</span>
                    ) : (
                      <ThumbsUp className='cursor-pointer' />
                    )
                  }
                  iconSize='md'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (message.id.startsWith('temp-') || !conversationId) return
                    const emojiToSend = quickReactEmoji
                    toggleReactionMutate({ messageId: message.id, emoji: emojiToSend })
                    // Optimistic — always add
                    queryClient.setQueryData(
                      chatKeys.messages(conversationId),
                      (oldData: InfiniteData<PageResponse<MessageResponse>> | undefined) => {
                        if (!oldData) return oldData
                        return {
                          ...oldData,
                          pages: oldData.pages.map((page: PageResponse<MessageResponse>) => ({
                            ...page,
                            data: page.data.map((m: MessageResponse) => {
                              if (m.id !== message.id) return m
                              const reactions: Record<string, string[]> = JSON.parse(JSON.stringify(m.reactions || {}))
                              const uid = user?.id || ''
                              const existing = reactions[emojiToSend] || []
                              reactions[emojiToSend] = [...existing, uid]
                              return { ...m, reactions }
                            })
                          }))
                        }
                      }
                    )
                  }}
                />
              </div>
            )}

            {/* ── Reaction badge (inside bubble, Zalo-style overlay) ── */}
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

          {!isRevoked && (
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
                />
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* ── Reaction Modal ── */}
        <ReactionModal
          open={reactionModalOpen}
          onClose={() => setReactionModalOpen(false)}
          reactions={message.reactions || {}}
          members={conversation?.members}
          currentUser={user ? { id: user.id, fullName: user.fullName, avatar: user.avatar ?? undefined } : undefined}
        />

        {isOwn &&
          (() => {
            const readers =
              conversation?.members?.filter((m: ConversationMemberResponse) => m.lastReadMessageId === message.id) || []
            const hasReaders = readers.length > 0
            const hasContent = hasReaders || isNewest
            if (!hasContent) return null
            return (
              <div className='flex flex-col items-end mt-1'>
                {(() => {
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
            )
          })()}
      </div>
    </div>
  )
}

function MessageMediaContent({ message }: { message: MessageResponse }) {
  const atts = message.attachments || []

  if (atts.length === 0) {
    return <span className='text-muted-foreground italic'>Đang tải...</span>
  }

  if (atts.length === 1) {
    const att = atts[0]
    if (!att.url) return <span className='text-muted-foreground italic'>Đang tải...</span>
    if (att.contentType.startsWith('video/')) {
      return <video src={att.url} controls className='max-w-xs max-h-[300px] rounded-md' preload='metadata' />
    }
    return (
      <a href={att.url} target='_blank' rel='noopener noreferrer'>
        <img
          src={att.url}
          alt={att.originalFileName || 'image'}
          className='max-w-xs max-h-[300px] rounded-md object-contain cursor-pointer hover:opacity-90 transition-opacity'
          loading='lazy'
        />
      </a>
    )
  }

  const gridClass = atts.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={cn('grid gap-0.5 rounded-md overflow-hidden w-[240px]', gridClass)}>
      {atts.map((att, i) => {
        const isVideo = att.contentType.startsWith('video/')
        return (
          <div key={`${att.url}-${i}`} className='relative overflow-hidden bg-muted aspect-square'>
            {isVideo ? (
              <video src={att.url} className='w-full h-full object-cover' preload='metadata' />
            ) : (
              <a href={att.url} target='_blank' rel='noopener noreferrer' className='block w-full h-full'>
                <img
                  src={att.url}
                  alt={att.originalFileName || 'image'}
                  className='w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity'
                  loading='lazy'
                />
              </a>
            )}
            {isVideo && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <div className='w-8 h-8 rounded-full bg-black/50 flex items-center justify-center'>
                  <Play size={14} className='text-white ml-0.5' />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MessageFileContent({ message }: { message: MessageResponse }) {
  const att = message.attachments?.[0]
  const fileUrl = att?.url
  const fileName = att?.originalFileName || att?.fileName || 'File'
  const fileSize = att?.size
  const contentType = att?.contentType || ''

  // Lấy extension từ tên file
  const ext = fileName.split('.').pop()?.toUpperCase() || ''

  // Màu icon theo loại file
  const getExtColor = () => {
    if (['PDF'].includes(ext)) return 'text-red-500'
    if (['DOC', 'DOCX'].includes(ext)) return 'text-blue-600'
    if (['XLS', 'XLSX'].includes(ext)) return 'text-green-600'
    if (['ZIP', 'RAR', '7Z'].includes(ext)) return 'text-yellow-600'
    return 'text-primary'
  }

  return (
    <div className='flex items-center gap-3 min-w-[200px]'>
      <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0', getExtColor())}>
        <FileIcon size={22} />
      </div>
      <div className='flex flex-col min-w-0 flex-1'>
        <span className='text-[14px] font-medium truncate max-w-[200px]'>{fileName}</span>
        <span className='text-[12px] text-muted-foreground'>
          {fileSize ? formatFileSize(fileSize) : ''}
          {contentType ? ` · ${ext}` : ''}
        </span>
      </div>
      {fileUrl && (
        <a
          href={fileUrl}
          download={fileName}
          target='_blank'
          rel='noopener noreferrer'
          className='p-1.5 hover:bg-muted rounded-full transition-colors shrink-0'
          title='Tải xuống'
        >
          <Download size={18} className='text-muted-foreground' />
        </a>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ────────────────────────────────────────────────────────────────
// ReactionModal — Zalo-style reaction viewer (no backdrop blur)
// ────────────────────────────────────────────────────────────────
function ReactionModal({
  open,
  onClose,
  reactions,
  members,
  currentUser
}: {
  open: boolean
  onClose: () => void
  reactions: Record<string, string[]>
  members?: ConversationMemberResponse[] | null
  currentUser?: { id: string; fullName: string; avatar?: string }
}) {
  const { text } = useChatText()
  const mb = text.messageBubble
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  const memberMap = new Map((members || []).map((m) => [m.userId, m]))

  // userId → Map<emoji, count>
  const userReactionMap = new Map<string, Map<string, number>>()
  for (const [emoji, userIds] of Object.entries(reactions)) {
    for (const uid of userIds) {
      if (!userReactionMap.has(uid)) userReactionMap.set(uid, new Map())
      const emojiMap = userReactionMap.get(uid)!
      emojiMap.set(emoji, (emojiMap.get(emoji) || 0) + 1)
    }
  }

  const totalCount = Object.values(reactions).reduce((s, ids) => s + ids.length, 0)

  // Build filtered user list
  const filteredUsers: Array<{ userId: string; emojiCounts: [string, number][]; userTotal: number }> = []
  if (selectedEmoji === null) {
    for (const [uid, emojiCountMap] of userReactionMap.entries()) {
      const userTotal = [...emojiCountMap.values()].reduce((s, c) => s + c, 0)
      filteredUsers.push({ userId: uid, emojiCounts: [...emojiCountMap.entries()], userTotal })
    }
  } else {
    const uniqueUids = [...new Set(reactions[selectedEmoji] || [])]
    for (const uid of uniqueUids) {
      const count = userReactionMap.get(uid)?.get(selectedEmoji) || 0
      filteredUsers.push({ userId: uid, emojiCounts: [[selectedEmoji, count]], userTotal: count })
    }
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center'>
      {/* Transparent click-away backdrop */}
      <div className='absolute inset-0' onClick={onClose} />

      {/* Modal card */}
      <div className='relative bg-background border rounded-xl shadow-2xl ring-1 ring-foreground/10 w-[520px] max-h-[520px] overflow-hidden flex flex-col z-10'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-3 border-b shrink-0'>
          <h3 className='text-[15px] font-semibold'>{mb.reactionModalTitle}</h3>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full p-1.5 hover:bg-muted transition-colors text-muted-foreground'
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className='flex flex-1 overflow-hidden'>
          {/* Left: emoji filter tabs */}
          <div className='w-32 shrink-0 border-r flex flex-col overflow-y-auto py-1'>
            <button
              type='button'
              onClick={() => setSelectedEmoji(null)}
              className={cn(
                'flex items-center justify-between px-4 py-2.5 text-[13px] font-medium w-full text-left transition-colors',
                selectedEmoji === null
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <span>{mb.reactionModalAll}</span>
              <span className='text-muted-foreground text-[12px] font-normal'>{totalCount}</span>
            </button>

            {Object.entries(reactions).map(([emoji, userIds]) => (
              <button
                key={emoji}
                type='button'
                onClick={() => setSelectedEmoji(emoji)}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 w-full text-left transition-colors',
                  selectedEmoji === emoji ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-muted'
                )}
              >
                <span style={{ fontSize: '20px' }}>{emoji}</span>
                <span className='text-muted-foreground text-[12px]'>{userIds.length}</span>
              </button>
            ))}
          </div>

          {/* Right: user list */}
          <div className='flex-1 overflow-y-auto py-2'>
            {filteredUsers.length === 0 ? (
              <p className='text-center text-muted-foreground text-[13px] mt-10'>{mb.reactionModalEmpty}</p>
            ) : (
              filteredUsers.map(({ userId, emojiCounts, userTotal }) => {
                const member = memberMap.get(userId)
                const isMe = userId === currentUser?.id
                const name = isMe ? currentUser?.fullName || member?.fullName || userId : member?.fullName || userId
                const avatar = isMe ? currentUser?.avatar || member?.avatar || undefined : member?.avatar || undefined
                return (
                  <div key={userId} className='flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50'>
                    <UserAvatar
                      src={avatar}
                      name={name}
                      className='w-10 h-10 shrink-0'
                      fallbackClassName='text-[14px]'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-[14px] font-medium truncate'>
                        {name}
                        {isMe && (
                          <span className='text-muted-foreground font-normal text-[13px]'>
                            {' '}
                            ({mb.reactionModalYou})
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Emojis + tổng */}
                    <div className='flex items-center gap-1.5 shrink-0'>
                      {emojiCounts.map(([e, count]) => (
                        <span key={e} className='flex items-center gap-0.5'>
                          <span style={{ fontSize: '18px' }}>{e}</span>
                          {selectedEmoji !== null && count > 1 && (
                            <span className='text-[12px] text-muted-foreground font-medium'>{count}</span>
                          )}
                        </span>
                      ))}
                      {selectedEmoji === null && userTotal > 1 && (
                        <span className='ml-1 text-[12px] text-muted-foreground font-medium'>{userTotal}</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
