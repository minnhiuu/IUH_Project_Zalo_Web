import { useState } from 'react'
import { Maximize2, X, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSocialText } from '../../i18n/use-social-text'
import { PATHS } from '@/constants/path'
import { MiniConversationList } from './mini-conversation-list'
import { ChatWindow } from '@/features/chat/components/chat-window'
import { getConversationDisplayName } from '@/features/chat/utils/group-name'
import type { ConversationResponse } from '@/features/chat/schemas/chat.schema'
import { useNotificationStateQuery } from '@/features/notification/queries/use-queries'

export function MiniChatWindow({ onClose }: { onClose: () => void }) {
  const { text } = useSocialText()
  const navigate = useNavigate()
  const [selectedChat, setSelectedChat] = useState<ConversationResponse | null>(null)
  
  const { data: notificationState } = useNotificationStateQuery()
  const unreadCount = notificationState?.chatUnreadConversationCount ?? 0

  const handleMaximize = () => {
    if (selectedChat) {
      navigate(`${PATHS.CHAT.CONVERSATION.replace(':id', selectedChat.id)}`)
    } else {
      navigate(PATHS.HOME)
    }
    onClose()
  }

  return (
    <div className='w-[350px] h-[550px] bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300'>
      {/* Header */}
      <div className='p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10'>
        <div className='flex items-center gap-2'>
          {selectedChat && (
            <button
              onClick={() => setSelectedChat(null)}
              className='p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors'
            >
              <ChevronLeft className='w-4 h-4 text-zinc-600 dark:text-zinc-400' />
            </button>
          )}
          <div className='flex items-center gap-2'>
            <h3 className='font-bold text-[14px] text-zinc-900 dark:text-white truncate max-w-[180px]'>
              {selectedChat
                ? getConversationDisplayName(selectedChat, 'Chat', undefined, undefined)
                : text.miniChat.title}
            </h3>
            {!selectedChat && unreadCount > 0 && (
              <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={handleMaximize}
            title={text.miniChat.maximize}
            className='p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors group'
          >
            <Maximize2 className='w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white' />
          </button>
          <button
            onClick={onClose}
            title={text.miniChat.close}
            className='p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors group'
          >
            <X className='w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white' />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-hidden flex flex-col relative'>
        {!selectedChat ? (
          <>
            {/* Conversation List */}
            <div className='flex-1 overflow-y-auto custom-scrollbar'>
              <MiniConversationList searchQuery={''} onSelect={(chat) => setSelectedChat(chat)} />
            </div>
          </>
        ) : (
          <div className='flex-1 mini-chat-embedded overflow-hidden bg-white dark:bg-zinc-950'>
            <ChatWindow
              conversation={selectedChat}
              snapshotId={null}
              capturedUnreadCount={0}
              capturedUnreadAnchor={null}
              onClearSnapshot={() => {}}
            />
            <style
              dangerouslySetInnerHTML={{
                __html: `
              /* HIDE ALL SIDEBARS by specific classes/attributes */
              .mini-chat-embedded [class*="ChatInfo"],
              .mini-chat-embedded [class*="SearchSidebar"],
              .mini-chat-embedded aside,
              .mini-chat-embedded [class*="z-[40]"],
              .mini-chat-embedded [class*="w-[340px]"],
              .mini-chat-embedded .absolute.inset-0.bg-black\\/20 {
                display: none !important;
              }
              
              /* Force main chat to occupy full space */
              .mini-chat-embedded > div > div:first-of-type {
                display: flex !important;
                width: 100% !important;
                height: 100% !important;
                position: relative !important;
                z-index: 1 !important;
              }

              /* Hide internal header and shadows */
              .mini-chat-embedded div[class*="h-[68px]"],
              .mini-chat-embedded div[class*="h-17"],
              .mini-chat-embedded [class*="ChatHeader"],
              .mini-chat-embedded div[class*="border-b"][class*="shadow-sm"] {
                display: none !important;
                height: 0 !important;
              }

              /* TEXT-ONLY MODE: Show placeholders instead of hiding completely */
              .mini-chat-embedded [class*="ImageGrid"],
              .mini-chat-embedded [class*="VideoPlayer"],
              .mini-chat-embedded [class*="FileAttachment"],
              .mini-chat-embedded [class*="image-grid"],
              .mini-chat-embedded [class*="video-player"],
              .mini-chat-embedded video {
                display: none !important;
              }

              .mini-chat-embedded .relative.group:has([class*="ImageGrid"]):after,
              .mini-chat-embedded .relative.group:has([class*="image-grid"]):after {
                content: "[Hình ảnh]" !important;
                font-size: 11px !important;
                opacity: 0.5 !important;
                font-style: italic !important;
              }

              .mini-chat-embedded .relative.group:has([class*="VideoPlayer"]):after,
              .mini-chat-embedded .relative.group:has([class*="video-player"]):after {
                content: "[Video]" !important;
                font-size: 11px !important;
                opacity: 0.5 !important;
                font-style: italic !important;
              }

              /* Hide only non-avatar images */
              .mini-chat-embedded img:not([class*="Avatar"]) {
                display: none !important;
              }

              /* Hide the input toolbar (emoji, image, file, etc.) */
              .mini-chat-embedded [class*="ChatInput"] > div:first-child {
                display: none !important;
              }

              .mini-chat-embedded [class*="ChatInput"] {
                padding: 4px 8px !important;
              }

              /* Compact messages - Refined rounding and wrapping fix */
              .mini-chat-embedded [class*="bg-blue-message"],
              .mini-chat-embedded [class*="bg-white-message"],
              .mini-chat-embedded [class*="bg-zinc-100"] {
                padding: 8px 14px !important;
                padding-bottom: 12px !important; /* Space for reaction */
                border-radius: 12px !important;
                max-width: 85% !important;
                font-size: 14px !important;
                word-break: break-word !important;
                overflow-wrap: break-word !important;
                white-space: pre-wrap !important;
                min-width: 80px !important; /* Force expansion to avoid reaction overlap */
                position: relative !important;
              }

              .mini-chat-embedded [class*="ChatInput"] {
                padding: 6px 10px !important;
              }

              /* TARGET JOIN LINK CARD - Final Stability */
              .mini-chat-embedded div[class*="JoinLinkCard"],
              .mini-chat-embedded [class*="JoinLinkCard"] > div {
                width: 250px !important;
                max-width: 100% !important;
                transform: none !important;
                transition: none !important;
                box-shadow: none !important;
              }

              .mini-chat-embedded div[class*="JoinLinkCard"]:hover,
              .mini-chat-embedded [class*="JoinLinkCard"] > div:hover {
                transform: none !important;
                box-shadow: none !important;
              }

              /* URL TEXT - Forced Wrap & Small */
              .mini-chat-embedded [class*="JoinLinkCard"] p[class*="underline"],
              .mini-chat-embedded [class*="JoinLinkCard"] a[class*="underline"],
              .mini-chat-embedded [class*="JoinLinkCard"] p:has(a) {
                display: block !important;
                font-size: 10px !important;
                color: #3b82f6 !important;
                word-break: break-all !important;
                white-space: normal !important;
                max-width: 100% !important;
                line-height: 1.2 !important;
                max-height: 2.4em !important; /* Max 2 lines */
                overflow: hidden !important;
                margin-bottom: 6px !important;
              }

              .mini-chat-embedded [class*="JoinLinkCard"] .p-4,
              .mini-chat-embedded [class*="JoinLinkCard"] .bg-\\[var\\(--brand-blue-light\\)\\] {
                padding: 6px 10px !important;
              }

              .mini-chat-embedded [class*="JoinLinkCard"] [class*="Avatar"] {
                width: 32px !important;
                height: 32px !important;
              }

              .mini-chat-embedded [class*="JoinLinkCard"] .text-\\[15px\\] {
                font-size: 13px !important;
                line-height: 1.3 !important;
                margin-bottom: 4px !important;
              }

              /* Reaction styling - Final Proper Positioning */
              .mini-chat-embedded [class*="reaction-badge"] {
                transform: scale(0.85) !important;
                bottom: -12px !important; 
                right: -10px !important;
                left: auto !important; /* Force to right */
                background-color: #f1f2f4 !important;
                border: 2px solid white !important;
                padding: 1px 4px !important;
                border-radius: 20px !important;
                z-index: 30 !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
              }

              .mini-chat-embedded .relative.group:has([class*="reaction-badge"]) {
                margin-bottom: 20px !important; 
              }

              /* SUPPRESS HOVER JUMPING - Final Stability Version */
              .mini-chat-embedded [class*="group/actions"] {
                gap: 0 !important;
                position: relative !important;
              }

              /* ELEVATE HOVERED ROW TO PREVENT Z-INDEX CLIPPING (Dialog bị đè) */
              /* Virtualized lists (e.g. react-virtuoso) use transform: translateY which traps z-index.
                 We MUST elevate the exact virtualized wrapper to escape the stacking context!
                 Also lock the elevation if a child dropdown menu is OPEN to prevent losing z-index on mouse leave. */
              .mini-chat-embedded div[data-index]:hover,
              .mini-chat-embedded div[data-item-index]:hover,
              .mini-chat-embedded div[data-known-size]:hover,
              .mini-chat-embedded div[style*="transform"]:hover,
              .mini-chat-embedded div[data-index]:has([data-state="open"]),
              .mini-chat-embedded div[data-index]:has([aria-expanded="true"]),
              .mini-chat-embedded div[style*="transform"]:has([data-state="open"]),
              .mini-chat-embedded div[style*="transform"]:has([aria-expanded="true"]) {
                z-index: 99999 !important;
              }

              .mini-chat-embedded [class*="group/actions"]:hover,
              .mini-chat-embedded div:has(> [class*="group/actions"]):hover,
              .mini-chat-embedded [class*="group/actions"]:has([data-state="open"]),
              .mini-chat-embedded [class*="group/actions"]:has([aria-expanded="true"]) {
                z-index: 9999 !important;
                position: relative !important;
              }

              .mini-chat-embedded div[class*="flex-col"]:has(> [class*="group/actions"]) {
                padding-bottom: 16px !important; /* Reserve space for absolute status */
              }

              /* Fix jumping caused by status/time below the message row */
              .mini-chat-embedded div[class*="flex-col"] > div[class*="mt-1"] {
                position: absolute !important;
                top: 100% !important;
                right: 4px !important; /* Default to right for own messages */
                margin-top: 2px !important;
                z-index: 10 !important;
                width: max-content !important;
                pointer-events: none !important;
              }

              /* --- RESTORE MESSAGE GAPS --- */
              /* Targeted the correct message container IDs (ChatWindow uses div id="msg-...") */
              .mini-chat-embedded div[id^="msg-"] {
                margin-bottom: 28px !important;
              }

              /* ======================================================================
                 THE REAL FIX: Target .msg-actions (the actual class on the action bar)
                 This div sits as a SIBLING of the bubble in the same flex-row.
                 When it appears on hover, it takes up horizontal space and pushes 
                 the bubble to shrink. Making it ABSOLUTE removes it from flex flow.
                 ====================================================================== */
              .mini-chat-embedded .msg-actions {
                position: absolute !important;
                top: -32px !important;
                right: 0 !important;
                z-index: 105 !important;
                display: flex !important;
                gap: 2px !important;
                background: white !important;
                padding: 3px 5px !important;
                border-radius: 16px !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
                width: max-content !important;
              }

              /* For others' messages, position on the left */
              .mini-chat-embedded div[class*="flex-row"]:not([class*="flex-row-reverse"]) > .msg-actions {
                right: auto !important;
                left: 0 !important;
              }

              /* Shrink the JoinLinkCard to fit mini chat (was 330px, too wide for 350px window) */
              .mini-chat-embedded [class*="w-\\[330px\\]"] {
                width: 200px !important;
                max-width: 100% !important;
              }

              /* Keep action bar visible when hovering the message row */
              .mini-chat-embedded .msg-actions {
                opacity: 0 !important;
                pointer-events: none !important;
                transition: opacity 0.15s !important;
              }
              .mini-chat-embedded [class*="group/actions"]:hover > .msg-actions,
              .mini-chat-embedded .msg-actions.is-open,
              .mini-chat-embedded .msg-actions:has([data-state="open"]) {
                opacity: 1 !important;
                pointer-events: auto !important;
              }

              /* "Sent" / "Seen by" status below newest own message - keep absolute */
              .mini-chat-embedded > div > div > div.flex.flex-col.items-end > div.flex.flex-col.items-end.mt-1 {
                position: relative !important;
              }

              /* Reaction Picker inside the bubble - already absolute, just ensure z-index */
              .mini-chat-embedded .relative.group button[class*="absolute"][class*="z-20"] {
                z-index: 30 !important;
              }

              /* Existing reaction badges stability */
              .mini-chat-embedded .relative.group:has([class*="reaction-badge"]) {
                margin-bottom: 16px !important;
              }
            `
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
