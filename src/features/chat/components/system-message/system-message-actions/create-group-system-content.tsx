import { useState } from 'react'
import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import { AtSign, Quote, UserRoundPlus } from 'lucide-react'
import { GroupAvatar } from '../../group/group-avatar'
import { UserAvatar } from '@/components/common/user-avatar'
import { CreateGroupDialog } from '../../group/create-group-dialog'

interface GroupMember {
  id: string
  avatar?: string | null
  name: string
}

interface CreateGroupSystemContentProps {
  conversationId?: string
  groupTitle: string
  groupMembers: GroupMember[]
  targetAvatars: GroupMember[]
  secondaryLabel: string | ReactNode
  t: TFunction<'chat'>
}

export function CreateGroupSystemContent({
  conversationId,
  groupTitle,
  groupMembers,
  targetAvatars,
  secondaryLabel,
  t
}: CreateGroupSystemContentProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const visibleMembers = groupMembers.slice(0, 7)
  const remainingCount = groupMembers.length - visibleMembers.length

  return (
    <>
      <div className='flex justify-center w-full my-4 px-4'>
        <div className='w-full'>
          <p className='text-center text-[28px] font-bold truncate max-w-120 mx-auto px-2'>{groupTitle}</p>

          <div className='w-full max-w-105 mx-auto px-2 py-1'>
            {groupMembers.length > 0 && (
              <div className='mt-3 flex items-center justify-center flex-wrap gap-2.5'>
                {visibleMembers.map((member) => (
                  <UserAvatar key={member.id} src={member.avatar} name={member.name} className='w-12 h-12' />
                ))}

                {remainingCount > 0 && (
                  <div className='w-12 h-12 rounded-full bg-muted text-foreground/80 flex items-center justify-center text-[10px] font-semibold'>
                    +{remainingCount}
                  </div>
                )}
              </div>
            )}

            <div className='mt-4 rounded-xl bg-background px-3 py-3 shadow-sm'>
              <div className='w-full flex items-center gap-0 text-left rounded-md px-2 py-1'>
                <span className='group-tips-icon group-tips-icon-invite'>
                  <UserRoundPlus className='w-5 h-5' />
                </span>
                <p className='group-tips-text'>
                  <button
                    type='button'
                    onClick={() => conversationId && setIsInviteDialogOpen(true)}
                    className='group-tips-link cursor-pointer'
                  >
                    {t('chat.system.group_tips.invite_cta')}
                  </button>{' '}
                  {t('chat.system.group_tips.invite_suffix', { groupName: groupTitle })}
                </p>
              </div>

              <div className='mt-2 flex items-center gap-0 px-2 py-1'>
                <span className='group-tips-icon group-tips-icon-mention'>
                  <AtSign className='w-5 h-5' />
                </span>
                <p className='group-tips-text'>
                  {t('chat.system.group_tips.mention_prefix')}{' '}
                  <span className='group-tips-link'>{t('chat.system.group_tips.mention_highlight')}</span>{' '}
                  {t('chat.system.group_tips.mention_suffix')}
                </p>
              </div>

              <div className='mt-2 flex items-center gap-0 px-2 py-1'>
                <span className='group-tips-icon group-tips-icon-reply'>
                  <Quote className='w-5 h-5' />
                </span>
                <p className='group-tips-text'>
                  {t('chat.system.group_tips.reply_prefix')}{' '}
                  <span className='font-bold'>"{t('chat.system.group_tips.reply_action')}"</span>{' '}
                  {t('chat.system.group_tips.reply_suffix')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {secondaryLabel && (
        <div className='flex justify-center w-full my-2.5 px-4'>
          <div className='system-msg flex items-center gap-2.5 py-1.5 px-3.5 max-w-[95%]'>
            {targetAvatars.length > 0 && (
              <GroupAvatar
                avatars={targetAvatars.map((a) => a.avatar)}
                names={targetAvatars.map((a) => a.name)}
                count={targetAvatars.length}
                size='xs'
                className='shrink-0'
              />
            )}
            <div className='flex-1 text-[12.5px] leading-relaxed text-left flex items-center gap-1.5'>
              {secondaryLabel}
            </div>
          </div>
        </div>
      )}

      {conversationId && (
        <CreateGroupDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          conversationId={conversationId}
        />
      )}
    </>
  )
}
