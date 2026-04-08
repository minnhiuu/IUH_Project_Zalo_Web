import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import { Key } from 'lucide-react'
import { useChatContext } from '@/features/chat/context/chat-context'
import type { ConversationResponse } from '@/features/chat/schemas/chat.schema'

const OPEN_GROUP_MANAGEMENT_EVENT = 'chat:open-group-management'

interface PromoteAdminCardProps {
  conversation?: ConversationResponse
  secondaryLabel: string | ReactNode
  t: TFunction<'chat'>
}

export function PromoteAdminCard({ conversation, secondaryLabel, t }: PromoteAdminCardProps) {
  const { sendMessage } = useChatContext()

  const handleSendGreeting = () => {
    if (!conversation?.id) return
    sendMessage(conversation.id, t('chat.system.promote_admin.greeting_message'))
  }

  const handleOpenManagementSidebar = () => {
    if (!conversation?.id) return
    window.dispatchEvent(
      new CustomEvent(OPEN_GROUP_MANAGEMENT_EVENT, {
        detail: { conversationId: conversation.id }
      })
    )
  }

  return (
    <>
      <div className='flex justify-center w-full my-4 px-4'>
        <div className='w-full max-w-105 mx-auto rounded-xl overflow-hidden border border-border shadow-sm'>
          <div className='relative h-36 w-full bg-brand-blue'>
            <img src='/images/admin-card.jpg' alt='Admin promotion' className='h-full w-full object-cover' />
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-20 h-20 rounded-full bg-white/30 border border-white/70 flex items-center justify-center shadow-sm'>
                <div className='w-15 h-15 rounded-full bg-white/90 flex items-center justify-center'>
                  <Key className='w-8 h-8 text-muted-foreground drop-shadow' />
                </div>
              </div>
            </div>
          </div>

          <div className='bg-background px-5 pt-4 pb-0 text-center'>
            <p className='text-[16px] font-bold text-foreground'>{t('chat.system.promote_admin.card_title')}</p>
            <p className='mt-1.5 text-[13px] text-muted-foreground leading-snug'>
              {t('chat.system.promote_admin.card_desc')}
            </p>

            <div className='mt-4 flex gap-0 justify-center border-t border-border'>
              <button
                type='button'
                onClick={handleOpenManagementSidebar}
                className='flex-1 py-2.5 text-[13px] font-medium text-primary hover:bg-muted/60 transition-colors border-r border-border'
              >
                {t('chat.system.promote_admin.manage_group')}
              </button>
              <button
                type='button'
                onClick={handleSendGreeting}
                className='flex-1 py-2.5 text-[13px] font-medium text-primary hover:bg-muted/60 transition-colors'
              >
                {t('chat.system.promote_admin.send_greeting')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {secondaryLabel && (
        <div className='flex justify-center w-full my-2.5 px-4'>
          <div className='system-msg flex items-center gap-2.5 py-1.5 px-3.5 max-w-[95%]'>
            <div className='flex-1 text-[12.5px] leading-relaxed text-left flex items-center gap-1.5 flex-wrap'>
              <Key className='system-msg-promote-icon' />
              <span>{secondaryLabel}</span>
              <button
                type='button'
                onClick={handleOpenManagementSidebar}
                className='system-msg-manage-link whitespace-nowrap pointer-events-auto'
              >
                {t('chat.system.promote_admin.manage_group')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
