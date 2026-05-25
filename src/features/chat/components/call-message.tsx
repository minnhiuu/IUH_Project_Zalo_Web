import type { MessageResponse } from '../schemas/chat.schema'
import { useAuth } from '@/features/auth'
import { useChatText } from '../i18n/use-chat-text'
import { cn } from '@/lib/utils'
import type { TFunction } from 'i18next'
import { Users, Phone, Video } from 'lucide-react'
import { MessageSenderAvatar } from './message-sender-avatar'

interface CallMetadata {
  callAction: 'ended' | 'missed' | 'rejected'
  durationSeconds: number
  callerId: string
  callerName: string
  receiverId: string
  receiverName: string
}

export interface GroupCallPayload {
  roomId: string
  callKind: 'voice' | 'video'
  status: 'active' | 'ended'
  callerName: string
}

function formatDuration(seconds: number, t: TFunction<'chat'>): string {
  if (seconds < 60) return t('call.duration_seconds', { count: seconds })
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (remaining === 0) return t('call.duration_minutes', { count: minutes })
  return t('call.duration_mixed', { minutes, seconds: remaining })
}

interface CallMessageProps {
  message: MessageResponse
  isOwn: boolean
  onRecall?: (receiverId: string) => void
  onJoinGroupCall?: (roomId: string, callKind: 'voice' | 'video') => void
  activeGroupCallId?: string | null
  onAvatarClick?: (userId: string) => void
}

export function CallMessage({ message, isOwn, onRecall, onJoinGroupCall, activeGroupCallId, onAvatarClick }: CallMessageProps) {
  const { user } = useAuth()
  const { t } = useChatText()

  // ─── Group Call Message Handling ─────────────────────────────
  const isGroupCall = message.content?.startsWith('[GROUP_CALL]::')
  if (isGroupCall) {
    let payload: GroupCallPayload | null = null
    try {
      payload = JSON.parse(message.content!.slice('[GROUP_CALL]::'.length))
    } catch {
      // ignore
    }

    if (!payload) return null

    const isActive = payload.status === 'active' && activeGroupCallId === payload.roomId
    const isVideo = payload.callKind === 'video'

    return (
      <div className={cn('flex w-full px-2 gap-2 my-1.5', isOwn ? 'justify-end' : 'justify-start')}>
        {!isOwn && (
          <div className='w-10 shrink-0 flex items-end'>
            <MessageSenderAvatar
              src={message.senderAvatar}
              name={message.senderName || 'Thành viên'}
              isGroup={true}
              onClick={() => message.senderId && onAvatarClick?.(message.senderId)}
            />
          </div>
        )}
        <div
          className={cn(
            'rounded-xl border overflow-hidden max-w-[280px] min-w-[220px] shadow-sm transition-all',
            isOwn
              ? 'bg-[#E5EFFF] border-[#D0E1FF] dark:bg-[#1a3a5c] dark:border-[#2a4a6c]'
              : 'bg-white border-gray-200 dark:bg-[#2a2a2a] dark:border-[#3a3a3a]'
          )}
        >
          {/* Header */}
          <div className='px-3 pt-3 pb-1 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5'>
              <Users className='w-4 h-4 text-blue-500' />
              <span className='text-[13px] font-semibold text-foreground'>Cuộc gọi nhóm</span>
            </div>
            {isActive && (
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
              </span>
            )}
          </div>

          {/* Description */}
          <div className='px-3 pb-2.5 flex items-start gap-2.5 mt-1'>
            <div className={cn('shrink-0 mt-0.5', isActive ? 'text-emerald-500' : 'text-gray-400')}>
              {isVideo ? <Video className='w-4 h-4' /> : <Phone className='w-4 h-4' />}
            </div>
            <div className='flex flex-col'>
              <span className='text-[12.5px] leading-tight text-foreground font-medium'>
                {isActive ? 'Đang diễn ra...' : 'Đã kết thúc'}
              </span>
              <span className='text-[11px] text-muted-foreground mt-0.5'>
                Bắt đầu bởi {payload.callerName}
              </span>
            </div>
          </div>

          {/* Join Call Action Button */}
          {isActive && onJoinGroupCall && (
            <>
              <div className='border-t border-gray-150 dark:border-gray-700' />
              <button
                onClick={() => onJoinGroupCall(payload!.roomId, payload!.callKind)}
                className='w-full py-2.5 text-center text-[13px] font-semibold text-blue-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.98]'
              >
                Tham gia cuộc gọi
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ─── 1:1 Call Message Handling ───────────────────────────────
  const meta = message.metadata as unknown as CallMetadata | undefined
  if (!meta) return null

  const isCaller = meta.callerId === user?.id
  const action = meta.callAction


  // Status header text — like Zalo: "Bạn đã hủy", "Cuộc gọi nhỡ", etc.
  let statusText: string
  // Call type label for the bubble body
  let callLabel: string
  // Icon color class
  let iconColorClass: string
  // Arrow direction for the phone icon
  let isOutgoing: boolean

  switch (action) {
    case 'ended':
      statusText = isCaller ? t('call.you_called') : t('call.they_called', { name: meta.callerName })
      callLabel = t('call.video_call') + ' - ' + formatDuration(meta.durationSeconds, t)
      iconColorClass = 'text-green-500'
      isOutgoing = isCaller
      break
    case 'missed':
      if (isCaller) {
        statusText = t('call.you_cancelled')
        callLabel = t('call.voice_call')
        iconColorClass = 'text-red-500'
        isOutgoing = true
      } else {
        statusText = t('call.missed_call')
        callLabel = t('call.voice_call')
        iconColorClass = 'text-red-500'
        isOutgoing = false
      }
      break
    case 'rejected':
      if (isCaller) {
        statusText = t('call.they_declined', { name: meta.receiverName })
        callLabel = t('call.video_call')
        iconColorClass = 'text-gray-400'
        isOutgoing = true
      } else {
        statusText = t('call.you_declined')
        callLabel = t('call.video_call')
        iconColorClass = 'text-gray-400'
        isOutgoing = false
      }
      break
    default:
      statusText = t('call.video_call')
      callLabel = t('call.video_call')
      iconColorClass = 'text-blue-500'
      isOutgoing = isCaller
  }

  const targetUserId = isCaller ? meta.receiverId : meta.callerId

  return (
    <div className={cn('flex w-full px-2 gap-2 my-1.5', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && <div className='w-10 shrink-0' />}
      <div
        className={cn(
          'rounded-xl border overflow-hidden max-w-[260px] min-w-[200px]',
          isOwn
            ? 'bg-[#E5EFFF] border-[#D0E1FF] dark:bg-[#1a3a5c] dark:border-[#2a4a6c]'
            : 'bg-white border-gray-200 dark:bg-[#2a2a2a] dark:border-[#3a3a3a]'
        )}
      >
        {/* Status header */}
        <div className='px-3 pt-2.5 pb-1'>
          <span className='text-[13px] font-medium text-foreground'>{statusText}</span>
        </div>

        {/* Call info row */}
        <div className='flex items-center gap-2.5 px-3 pb-2'>
          <div className={cn('shrink-0', iconColorClass)}>
            {isOutgoing ? (
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' className='inline-block'>
                <path
                  d='M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z'
                  fill='currentColor'
                />
                <path
                  d='M16 3l4 4m0 0l-4 4m4-4H14'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' className='inline-block'>
                <path
                  d='M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z'
                  fill='currentColor'
                />
                <path
                  d='M22 3l-4 4m0 0l4 4m-4-4h6'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
          </div>
          <span className='text-[12.5px] text-muted-foreground'>{callLabel}</span>
        </div>

        {/* Divider + Recall button */}
        {onRecall && (
          <>
            <div className='border-t border-gray-200 dark:border-gray-600' />
            <button
              onClick={() => onRecall(targetUserId)}
              className='w-full py-2 text-center text-[13px] font-medium text-blue-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors'
            >
              {t('call.recall')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
