import { Camera, Copy, Forward, LogOut, Pencil, Settings } from 'lucide-react'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { UserAvatar } from '@/components/common/user-avatar'
import { getConversationDisplayName } from '../../../utils/group-name'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/common/action-button'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { CustomTooltip } from '@/components/common/custom-tooltip'
import { canChangeGroupInfo } from '../../../utils/group-permissions'
import { showWarningToast } from '@/utils/toast'
import { useTranslation } from 'react-i18next'

interface GroupInfoOverviewText {
  membersCount: (count: number) => string
  media: string
  sendMessage: string
  groupLink: string
  management: string
  leaveGroup: string
}

interface GroupInfoOverviewStepProps {
  conversation: ConversationResponse
  currentUserId?: string
  text: GroupInfoOverviewText
  onAvatarClick: () => void
  onRenameClick: () => void
  onCloseDialog: () => void
  onOpenManagement: () => void
  onLeaveGroup: () => void
}

export function GroupInfoOverviewStep({
  conversation,
  currentUserId,
  text,
  onAvatarClick,
  onRenameClick,
  onCloseDialog,
  onOpenManagement,
  onLeaveGroup
}: GroupInfoOverviewStepProps) {
  const { t } = useTranslation('chat')

  const handleRenameClick = () => {
    if (!canChangeGroupInfo(conversation, currentUserId || '')) {
      showWarningToast(t('chat.restricted.cannotRename'))
      return
    }
    onRenameClick()
  }

  const handleAvatarClick = () => {
    if (!canChangeGroupInfo(conversation, currentUserId || '')) {
      showWarningToast(t('chat.restricted.cannotChangeAvatar'))
      return
    }
    onAvatarClick()
  }

  return (
    <div className='flex flex-col bg-bg-dialog-secondary w-full text-left'>
      <div className='bg-background px-6 py-4 flex flex-col items-stretch gap-3 border-b border-border/50 w-full overflow-visible'>
        <div className='flex items-center gap-3.5 w-full min-w-0 min-h-18'>
          <div
            onClick={handleAvatarClick}
            className='relative self-center group/avatar cursor-pointer hover:ring-4 hover:ring-primary/10 rounded-full transition-all shrink-0'
          >
            <div
              className='w-18 h-18 rounded-full overflow-hidden flex items-center justify-center bg-bg-avt-group-placeholder'
              style={{ border: '1px solid var(--border-avt-group)' }}
            >
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={getConversationDisplayName(conversation, 'Group', undefined, currentUserId)}
                  className='w-full h-full object-cover'
                />
              ) : (
                <img src='/images/avt-group.png' alt='Group' className='w-10 h-10 object-contain invert opacity-90' />
              )}
            </div>
            <ActionButton
              icon={<Camera />}
              size='sm'
              iconSize='sm'
              onClick={handleAvatarClick}
              className='absolute bottom-0 right-0.5 w-6.5 h-6.5 bg-background border border-border shadow-sm text-icon-secondary group-hover/avatar:bg-muted'
              aria-label='Change group avatar'
            />
          </div>

          <div className='flex-1 min-w-0 min-h-18 flex items-center gap-2 overflow-hidden'>
            <h3 className='text-[18px] leading-tight font-bold text-foreground truncate whitespace-nowrap overflow-hidden max-w-55'>
              {getConversationDisplayName(conversation, 'Group', undefined, currentUserId)}
            </h3>
            <ActionButton
              className='self-center'
              icon={<Pencil />}
              onClick={handleRenameClick}
              size='sm'
              iconSize='sm'
            />
          </div>
        </div>
        <Button
          variant='secondary'
          onClick={onCloseDialog}
          className='w-full bg-bg-btn-chat/80 hover:bg-bg-btn-chat/60 text-text-btn-chat font-semibold h-8.5 rounded-md border-none transition-colors'
        >
          {text.sendMessage}
        </Button>
      </div>

      <div className='bg-background mt-1.5 px-5 py-3 border-y border-border/50 overflow-visible'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-[14px] font-bold text-foreground'>
            {text.membersCount(conversation.members?.length || 0)}
          </span>
        </div>
        <div className='flex items-center overflow-visible -mx-0.5'>
          <div className='flex -space-x-2.5 items-center overflow-visible'>
            {conversation.members?.slice(0, 4).map((m) => (
              <CustomTooltip key={m.userId} content={m.fullName} position='bottom'>
                <UserAvatar
                  src={m.avatar}
                  name={m.fullName}
                  className='w-9 h-9 border-2 border-background ring-0 shadow-sm transition-transform'
                />
              </CustomTooltip>
            ))}
          </div>
          <button
            onClick={onCloseDialog}
            className='w-8.5 h-8.5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors shrink-0 cursor-pointer -ml-0.5'
          >
            <div className='text-[17px] font-bold leading-none pb-1'>...</div>
          </button>
        </div>
      </div>

      <div className='bg-background mt-1.5 px-6 py-4 border-y border-border/50 w-full'>
        <div className='flex items-center justify-between mb-3 px-0.5'>
          <span className='text-[14px] font-bold text-foreground'>{text.media}</span>
        </div>
        <div className='grid grid-cols-4 gap-2 px-0.5'>
          {[
            'https://picsum.photos/id/10/200/200',
            'https://picsum.photos/id/11/200/200',
            'https://picsum.photos/id/12/200/200'
          ].map((url, idx) => (
            <div
              key={idx}
              className='aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity'
            >
              <img src={url} alt='Media' className='w-full h-full object-cover' />
            </div>
          ))}
          <div className='aspect-square rounded-md bg-bg-brand-subtle flex items-center justify-center cursor-pointer hover:bg-bg-brand-subtle-hover transition-colors'>
            <div className='text-text-brand-vibrant'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M5 12h14' />
                <path d='m12 5 7 7-7 7' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-background mt-1.5 border-y border-border/50 flex flex-col w-full'>
        <ActionMenuItem
          as='div'
          icon={
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='rotate-45'
            >
              <path d='m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48' />
            </svg>
          }
          label={text.groupLink}
          subLabel={`https://zalo.me/g/zvime${conversation.id.slice(0, 5)}`}
          rightElement={
            <div className='flex items-center gap-2'>
              <ActionButton icon={<Copy />} />
              <ActionButton icon={<Forward />} />
            </div>
          }
          className='hover:bg-transparent'
        />

        <ActionMenuItem icon={<Settings />} label={text.management} onClick={onOpenManagement} showDivider={true} />
        <ActionMenuItem
          icon={<LogOut />}
          label={text.leaveGroup}
          variant='destructive'
          showDivider={true}
          onClick={onLeaveGroup}
        />
      </div>
    </div>
  )
}
