import { BaseDialog } from '@/components/common/base-dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import type { MessageResponse } from '../schemas/chat.schema'
import type { MessageSeenResponse } from '../api/chat.api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState } from 'react'
import { OthersProfileDialog } from '@/features/user/components/profile-dialog/others/others-profile-dialog'
import { MessageType } from '@/constants/enum'
import { useChatText } from '../i18n/use-chat-text'
import { stripMentionsForPreview } from '../utils/mention'

interface MessageInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: MessageResponse
  seenMembers: MessageSeenResponse[]
  loading: boolean
}

export function MessageInfoDialog({ open, onOpenChange, message, seenMembers, loading }: MessageInfoDialogProps) {
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const { text } = useChatText()

  const isToday = !!message.createdAt && new Date(message.createdAt).toDateString() === new Date().toDateString()
  const timeStr = message.createdAt
    ? isToday
      ? `${text['message-info-dialog'].today} • ${format(new Date(message.createdAt), 'HH:mm')}`
      : format(new Date(message.createdAt), 'dd/MM/yyyy • HH:mm', { locale: vi })
    : ''

  const getPreviewContent = () => {
    switch (message.type) {
      case MessageType.Image:
        return text.type.image || '[Hình ảnh]'
      case MessageType.Video:
        return text['message-info-dialog'].videoCall || 'Video'
      case MessageType.File:
        return text.type.file || '[File]'
      case MessageType.Link:
        return message.content || text.type.link || '[Link]'
      case MessageType.Call:
        return text['message-info-dialog'].voiceCall || 'Cuộc gọi'
      default:
        return stripMentionsForPreview(message.content || '')
    }
  }

  return (
    <>
      <BaseDialog
        open={open}
        onOpenChange={onOpenChange}
        title={text['message-info-dialog'].title}
        className='w-[440px]'
        noContentPadding
      >
        <div className='flex flex-col bg-background'>
          {/* Message Preview Section - Styled like real message bubble */}
          <div className='pl-6 pr-3 py-5 flex justify-end bg-background'>
            <div className='relative bg-blue-message text-foreground px-3.5 py-2.5 rounded-xl shadow-sm border border-border/20 max-w-[300px]'>
              <div className='text-[13px] font-semibold text-text-secondary mb-0.5 truncate'>
                {message.senderName || text['message-info-dialog'].sender}
              </div>
              <div className='text-[15px] mb-2 break-words leading-snug'>
                {getPreviewContent()}
              </div>
              <div className='text-[11px] text-text-secondary font-medium tracking-tight'>
                {timeStr}
              </div>
            </div>
          </div>

          <div className='border-t border-border mx-5' />


          {/* Seen Section */}
          <div className='flex flex-col flex-1 py-3'>
            <div className='px-6 pb-3 font-bold text-[14px] text-foreground'>
              {text['message-info-dialog'].seen(seenMembers.length)}
            </div>

            <div className='flex flex-col overflow-y-auto max-h-[350px] min-h-[150px] custom-scrollbar'>
              {loading ? (
                <div className='flex items-center justify-center p-10 text-sm text-muted-foreground'>{text.loading}</div>
              ) : seenMembers.length === 0 ? (
                <div className='flex items-center justify-center p-10 text-sm text-muted-foreground'>
                  {text['message-info-dialog'].noOneSeen}
                </div>
              ) : (
                <div className='flex flex-col'>
                  {seenMembers.map((member) => (
                    <div
                      key={member.userId}
                      onClick={() => setProfileUserId(member.userId)}
                      className='flex items-center gap-3 px-6 py-2 hover:bg-muted/50 cursor-pointer transition-colors group'
                    >
                      <UserAvatar
                        src={member.avatar}
                        name={member.fullName || 'User'}
                        className='w-9 h-9 border border-border/30'
                      />
                      <span className='text-[14px] font-medium text-foreground/90 group-hover:text-primary transition-colors'>
                        {member.fullName || member.userId}
                      </span>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </div>
        </div>
      </BaseDialog>


      <OthersProfileDialog
        open={!!profileUserId}
        onOpenChange={(open) => !open && setProfileUserId(null)}
        userId={profileUserId ?? undefined}
      />
    </>
  )
}
