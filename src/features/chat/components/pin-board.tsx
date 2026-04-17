import { useState } from 'react'
import { MessageSquare, MoreHorizontal, Copy, Pin, ChevronDown, ChevronUp } from 'lucide-react'
import { usePinsQuery } from '../queries/use-queries'
import { useUnpinMessageMutation } from '../queries/use-mutations'
import { useChatText } from '../i18n/use-chat-text'
import { stripMentionsForPreview } from '../utils/mention'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { showSimpleToast } from '@/utils/toast'
import type { PinnedMessageInfo } from '../schemas/chat.schema'
import { motion, AnimatePresence } from 'framer-motion'

interface PinBoardProps {
  conversationId: string
  onScrollToMessage: (messageId: string) => void
}

export function PinBoard({ conversationId, onScrollToMessage }: PinBoardProps) {
  const { data: pins } = usePinsQuery(conversationId)
  const { mutate: unpin } = useUnpinMessageMutation()
  const { text } = useChatText()
  const [expanded, setExpanded] = useState(false)

  if (!pins || pins.length === 0) return null

  const latest = pins[0]
  const extraCount = pins.length - 1

  return (
    <>
      <AnimatePresence>
        {expanded && pins.length > 1 && (
          <motion.div
            key='backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 z-30 bg-black/40'
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(false)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && pins.length > 1 && (
          <motion.div
            key='expanded'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='absolute top-3 left-3 right-3 z-40 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.15)] rounded-[8px] overflow-hidden bg-background border border-border/80'
          >
            {/* Header */}
            <div
              className='flex items-center justify-between px-4 py-2 border-b border-border/40 shrink-0 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors'
              onClick={() => setExpanded(false)}
            >
              <span className='text-[13px] font-semibold text-foreground/80 tracking-wide'>
                Pinboard ({pins.length})
              </span>
              <button className='flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground font-medium transition-colors'>
                {text.pinBoard.collapse} <ChevronUp className='w-4 h-4' />
              </button>
            </div>

            {/* List items */}
            <div className='overflow-y-auto max-h-[50vh] custom-scrollbar divide-y divide-border/40 bg-background'>
              {pins.map((pin) => (
                <ExpandedPinRow
                  key={pin.messageId}
                  pin={pin}
                  text={text}
                  onScrollToMessage={(msgId) => {
                    onScrollToMessage(msgId)
                    setExpanded(false)
                  }}
                  onUnpin={() => unpin({ conversationId, messageId: pin.messageId })}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <div
          className='flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors select-none w-full bg-background border-b border-border/60 relative z-20'
          onClick={() => onScrollToMessage(latest.messageId)}
        >
          {/* Left: message icon */}
          <div className='shrink-0 flex items-center justify-center mt-0.5'>
            <MessageSquare className='w-[18px] h-[18px] text-blue-500 fill-blue-500/10' strokeWidth={2} />
          </div>

          {/* Center: title + sender: content */}
          <div className='flex-1 min-w-0'>
            <p className='text-[13px] font-semibold text-foreground leading-tight mb-[2px]'>{text.pinBoard.title}</p>
            <p className='text-[13px] text-muted-foreground truncate leading-snug'>
              <span className='font-medium text-foreground/80'>{latest.pinnedByName}:</span>{' '}
              {stripMentionsForPreview(latest.contentSnapshot)}
            </p>
          </div>

          {/* Right actions */}
          <div className='flex items-center gap-2.5 shrink-0 pr-1' onClick={(e) => e.stopPropagation()}>
            {/* +X pin toggle */}
            {extraCount > 0 && (
              <button
                className='flex items-center gap-1 text-[12px] font-medium text-foreground/80 hover:text-foreground border border-border/80 hover:bg-muted/50 px-2 py-0.5 rounded-[4px] transition-colors'
                onClick={() => setExpanded(true)}
              >
                +{extraCount} pin
                <ChevronDown className='w-3.5 h-3.5' />
              </button>
            )}

            {/* ... menu for the latest pin */}
            <PinMoreMenu
              pin={latest}
              text={text}
              onUnpin={() => unpin({ conversationId, messageId: latest.messageId })}
            />
          </div>
        </div>
      )}
    </>
  )
}

/* ── ... menu for a single pin ── */
function PinMoreMenu({
  pin,
  text,
  onUnpin
}: {
  pin: PinnedMessageInfo
  text: Record<string, unknown>
  onUnpin: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className='p-1 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className='w-[18px] h-[18px]' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='end' className='w-44 rounded-xl z-[60]'>
        <DropdownMenuItem
          className='flex items-center gap-2 cursor-pointer text-[13px]'
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(pin.contentSnapshot)
            showSimpleToast(text.pinBoard.copy, 1200)
          }}
        >
          <Copy className='w-4 h-4' />
          {text.pinBoard.copy}
        </DropdownMenuItem>
        <DropdownMenuItem
          className='flex items-center gap-2 cursor-pointer text-[13px] text-destructive focus:text-destructive'
          onClick={(e) => {
            e.stopPropagation()
            onUnpin()
          }}
        >
          <Pin className='w-4 h-4' />
          {text.pinBoard.unpin}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ── Row inside expanded list ── */
function ExpandedPinRow({
  pin,
  text,
  onScrollToMessage,
  onUnpin
}: {
  pin: PinnedMessageInfo
  text: Record<string, unknown>
  onScrollToMessage: (messageId: string) => void
  onUnpin: () => void
}) {
  return (
    <div
      className='flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group bg-background'
      onClick={() => onScrollToMessage(pin.messageId)}
    >
      <div className='shrink-0 mt-0.5'>
        <MessageSquare className='w-[18px] h-[18px] text-blue-500 fill-blue-500/10' strokeWidth={2} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[13px] font-semibold text-foreground leading-tight mb-[2px]'>{text.pinBoard.title}</p>
        <p className='text-[13px] text-muted-foreground truncate leading-snug'>
          <span className='font-medium text-foreground/80'>{pin.pinnedByName}:</span>{' '}
          {stripMentionsForPreview(pin.contentSnapshot)}
        </p>
      </div>
      <div
        className='shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-1'
        onClick={(e) => e.stopPropagation()}
      >
        <PinMoreMenu pin={pin} text={text} onUnpin={onUnpin} />
      </div>
    </div>
  )
}
