import { cn } from '@/lib/utils'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { ThumbsUp, X } from 'lucide-react'
import { MessageIconButton } from './message-icon-button'
import { useToggleReactionMutation, useRemoveAllMyReactionsMutation } from '../queries/use-mutations'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { PageResponse } from '@/shared/api'
import { chatKeys } from '../queries/keys'

export function MessageReactionPicker({
  message,
  quickReactEmoji,
  setQuickReactEmoji,
  conversationId,
  isOwn,
  onMouseEnter,
  onMouseLeave
}: {
  message: MessageResponse
  quickReactEmoji: string | null
  setQuickReactEmoji: (emoji: string | null) => void
  conversationId?: string
  isOwn?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const { text } = useChatText()
  const mb = text.messageBubble
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { mutate: toggleReactionMutate } = useToggleReactionMutation()
  const { mutateAsync: removeAllMyReactionsAsync } = useRemoveAllMyReactionsMutation()

  const applyOptimisticAdd = (emoji: string) => {
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
              const reactions: Record<string, string[]> = JSON.parse(JSON.stringify(m.reactions || {}))
              const uid = String(user?.id || '')
              reactions[emoji] = [...(reactions[emoji] || []), uid]
              return { ...m, reactions }
            })
          }))
        }
      }
    )
  }

  const applyOptimisticRemoveAll = () => {
    if (!conversationId || message.id.startsWith('temp-') || !user?.id) return
    const uid = user.id
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
  }

  const hasMyReaction =
    !!user?.id &&
    Object.entries(message.reactions || {}).some(([, uids]) => uids.map(String).includes(String(user.id)))

  return (
    <div
      className={cn('absolute -bottom-2 right-0.5 z-10 group/like cursor-pointer', 'hidden group-hover:flex')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Reaction Picker Popover */}
      <div
        className={cn(
          'absolute bottom-full mb-1.5 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-border rounded-full shadow-2xl px-3 py-2 opacity-0 pointer-events-none group-hover/like:opacity-100 group-hover/like:pointer-events-auto flex items-center gap-2 transition-all duration-200 animate-in fade-in zoom-in-95 after:content-[""] after:absolute after:top-full after:left-0 after:right-0 after:h-8',
          isOwn ? 'right-0' : 'left-0'
        )}
      >
        {(['👍', '❤️', '🤣', '😮', '😢', '😡'] as const).map((emoji) => (
          <button
            key={emoji}
            type='button'
            className='leading-none hover:scale-125 transition-transform focus:outline-none'
            style={{ cursor: 'pointer', fontSize: '20px' }}
            onClick={() => {
              if (user?.id) {
                localStorage.setItem(`chat_last_emoji_${user.id}`, emoji)
                setQuickReactEmoji(emoji)
              }
              toggleReactionMutate({ messageId: message.id, emoji })
              applyOptimisticAdd(emoji)
            }}
          >
            {emoji}
          </button>
        ))}
        {/* Nút X — xóa toàn bộ reaction của tôi */}
        {hasMyReaction && (
          <button
            type='button'
            title={mb.removeAllMyReactions}
            className='w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0'
            onClick={async () => {
              if (!conversationId || message.id.startsWith('temp-') || !user?.id) return
              const myEmojis = Object.entries(message.reactions || {})
                .filter(([, uids]) => uids.map(String).includes(String(user.id)))
                .map(([e]) => e)
              if (myEmojis.length === 0) return
              applyOptimisticRemoveAll()
              await removeAllMyReactionsAsync({ messageId: message.id }).catch(() => {})
              setQuickReactEmoji(null)
              if (user?.id) localStorage.removeItem(`chat_last_emoji_${user.id}`)
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Nút quick-react */}
      <MessageIconButton
        className='h-6 w-6 bg-background border-border/80 text-icon-secondary hover:text-icon-secondary hover:bg-background cursor-pointer!'
        aria-label={mb.like}
        icon={
          quickReactEmoji !== null ? (
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{quickReactEmoji}</span>
          ) : (
            <ThumbsUp className='cursor-pointer' />
          )
        }
        iconSize='md'
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (message.id.startsWith('temp-') || !conversationId) return
          const emoji = quickReactEmoji ?? '👍'
          toggleReactionMutate({ messageId: message.id, emoji })
          applyOptimisticAdd(emoji)
        }}
      />
    </div>
  )
}
