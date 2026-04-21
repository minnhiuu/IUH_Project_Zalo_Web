import { cn } from '@/lib/utils'
import type { ConversationMemberResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { UserAvatar } from '@/components/common/user-avatar'
import { X } from 'lucide-react'
import { useState } from 'react'

export function ReactionModal({
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

  // Danh sách người dùng đã lọc
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
      {/* Backdrop trong suốt để đóng modal */}
      <div className='absolute inset-0' onClick={onClose} />

      {/* Card modal */}
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
          {/* Trái: tab lọc emoji */}
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

          {/* Phải: danh sách người dùng */}
          <div className='flex-1 overflow-y-auto py-2'>
            {filteredUsers.length === 0 ? (
              <p className='text-center text-muted-foreground text-[13px] mt-10'>{mb.reactionModalEmpty}</p>
            ) : (
              filteredUsers.map(({ userId, emojiCounts, userTotal }) => {
                const member = memberMap.get(userId)
                const isMe = userId === currentUser?.id
                const name = isMe
                  ? currentUser?.fullName || member?.fullName || userId
                  : member?.fullName || userId
                const avatar = isMe
                  ? currentUser?.avatar || member?.avatar || undefined
                  : member?.avatar || undefined
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
