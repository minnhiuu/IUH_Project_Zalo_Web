import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GroupMemberListItemResponse } from '../schemas/chat.schema'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useChatText } from '../i18n/use-chat-text'

interface MentionDropdownProps {
  members: GroupMemberListItemResponse[]
  query: string
  onSelect: (member: GroupMemberListItemResponse) => void
  onClose: () => void
  showAllMention?: boolean
}

export function MentionDropdown({ members, query, onSelect, onClose, showAllMention }: MentionDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { text } = useChatText()

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const filtered = query
    ? members.filter((m) => m.fullName.toLowerCase().includes(query.toLowerCase()))
    : members

  const showAll = showAllMention && (!query || 'all'.includes(query.toLowerCase()))

  if (filtered.length === 0 && !showAll) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        key='mention-dropdown'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className='absolute bottom-full left-0 mb-2 ml-4 w-[320px] z-50 bg-background border border-border/80 rounded-xl shadow-lg overflow-hidden max-h-[300px] flex flex-col'
      >
        {/* Header/Instructions */}
        <div className='px-4 py-2.5 border-b border-border/50 bg-muted/20 flex flex-col'>
          <span className='text-[12px] text-muted-foreground'>
            {text.mentionDropdown.instruction}
          </span>
        </div>

        {/* Member list */}
        <div className='py-1 overflow-y-auto custom-scrollbar'>
          {showAll && (
            <button
              type='button'
              className='w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/60 transition-colors text-left'
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect({
                  userId: 'all',
                  fullName: 'All',
                  avatar: null,
                  phoneNumber: null,
                  isFriend: false,
                  isCurrentUser: false
                })
              }}
            >
              <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0'>
                <span className='text-white text-[18px] font-bold leading-none select-none'>@</span>
              </div>
              <span className='text-[13.5px] text-foreground leading-snug'>{text.mentionDropdown.notifyAll}</span>
            </button>
          )}
          {filtered.map((member) => (
            <button
              key={member.userId}
              type='button'
              className='w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/60 transition-colors text-left'
              onMouseDown={(e) => {
                // prevent blur on textarea
                e.preventDefault()
                onSelect(member)
              }}
            >
              <Avatar className='w-8 h-8 shrink-0'>
                <AvatarImage src={member.avatar ?? undefined} alt={member.fullName} />
                <AvatarFallback className='text-[12px] font-semibold bg-primary/10 text-primary'>
                  {member.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className='text-[13.5px] font-medium text-foreground leading-snug'>
                {member.fullName}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
