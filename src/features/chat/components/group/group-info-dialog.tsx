import { Camera, Copy, Forward, LogOut, Pencil, Settings } from 'lucide-react'
import { BaseDialog } from '@/components/common/base-dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/common/action-button'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { useChatText } from '../../i18n/use-chat-text'
import type { ConversationResponse } from '../../schemas/chat.schema'
import { CustomTooltip } from '@/components/common/custom-tooltip'

interface GroupInfoDialogProps {
  conversation: ConversationResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  onRenameClick: () => void
  onAvatarClick: () => void
}

export function GroupInfoDialog({
  conversation,
  open,
  onOpenChange,
  onRenameClick,
  onAvatarClick
}: GroupInfoDialogProps) {
  const { text } = useChatText()

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text['group-info-dialog'].title}
      noContentPadding={true}
      className='overflow-visible'
    >
      <div className='flex-1 flex flex-col h-full bg-bg-dialog-secondary w-full text-left'>
        <div className='bg-background p-6 flex flex-col items-stretch gap-4 border-b border-border/50 w-full overflow-hidden'>
          <div className='flex items-center gap-4 w-full min-w-0'>
            <div
              onClick={onAvatarClick}
              className='relative group/avatar cursor-pointer hover:ring-4 hover:ring-primary/10 rounded-full transition-all shrink-0'
            >
              <div
                className='w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-bg-avt-group-placeholder'
                style={{ border: '1px solid var(--border-avt-group)' }}
              >
                {conversation.avatar ? (
                  <img
                    src={conversation.avatar}
                    alt={conversation.name ?? 'Group'}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <img src='/images/avt-group.png' alt='Group' className='w-12 h-12 object-contain invert opacity-90' />
                )}
              </div>
              <div className='absolute bottom-0 right-1 p-1.5 bg-background border border-border rounded-full shadow-sm group-hover/avatar:bg-muted transition-colors'>
                <Camera className='h-4 w-4 text-icon-secondary' />
              </div>
            </div>

            <div className='flex-1 min-w-0 flex items-center gap-2 overflow-hidden'>
              <h3 className='text-[18px] font-bold text-foreground truncate whitespace-nowrap overflow-hidden max-w-[220px]'>
                {conversation.name}
              </h3>
              <ActionButton 
                icon={<Pencil />} 
                onClick={onRenameClick}
                size='sm'
                iconSize='sm'
              />
            </div>
          </div>
          <Button
            variant='secondary'
            onClick={() => onOpenChange(false)}
            className='w-full bg-bg-btn-chat/80 hover:bg-bg-btn-chat/60 text-text-btn-chat font-semibold h-9 rounded-md border-none transition-colors'
          >
            {text['group-info-dialog'].sendMessage}
          </Button>
        </div>

        {/* Members Section */}
        <div className='bg-background mt-2 p-4 border-y border-border/50 overflow-visible'>
          <div className='flex items-center justify-between mb-3 px-1'>
            <span className='text-[14px] font-bold text-foreground'>
              {text['group-info-dialog'].membersCount(conversation.members?.length || 0)}
            </span>
          </div>
          <div className='flex items-center p-1 overflow-visible'>
            <div className='flex -space-x-3 items-center overflow-visible'>
              {conversation.members?.slice(0, 4).map((m) => (
                <CustomTooltip key={m.userId} content={m.fullName} position='bottom'>
                  <UserAvatar
                    src={m.avatar}
                    name={m.fullName}
                    className='w-10 h-10 border-2 border-background ring-0 shadow-sm transition-transform'
                  />
                </CustomTooltip>
              ))}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className='w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors shrink-0 cursor-pointer -ml-0.5'
            >
              <div className='text-lg font-bold leading-none pb-1'>...</div>
            </button>
          </div>
        </div>

        {/* Media Section with Fake Images */}
        <div className='bg-background mt-2 p-4 border-y border-border/50 w-full'>
          <div className='flex items-center justify-between mb-3 px-1'>
            <span className='text-[14px] font-bold text-foreground'>{text['group-info-dialog'].media}</span>
          </div>
          <div className='grid grid-cols-4 gap-2 px-1'>
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

        {/* Group Link Section - Realigned to match bottom buttons */}
        <div className='bg-background mt-2 border-y border-border/50 flex flex-col w-full'>
          <div className='flex items-start gap-3 px-4 py-3.5'>
            <div className='p-1 shrink-0'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-icon-secondary rotate-45'
              >
                <path d='m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48' />
              </svg>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-[15px] font-medium text-foreground'>{text['group-info-dialog'].groupLink}</p>
              <p className='text-[13px] text-text-brand-vibrant truncate hover:underline cursor-pointer leading-tight mt-0.5'>
                https://zalo.me/g/zvime{conversation.id.slice(0, 5)}
              </p>
            </div>
            <div className='flex items-center gap-2 shrink-0 ml-2'>
              <ActionButton icon={<Copy />} />
              <ActionButton icon={<Forward />} />
            </div>
          </div>

          <ActionMenuItem 
            icon={<Settings />} 
            label={text['group-info-dialog'].management} 
            showDivider={true} 
          />

          <ActionMenuItem 
            icon={<LogOut />} 
            label={text['group-info-dialog'].leaveGroup} 
            variant='destructive' 
            showDivider={true} 
          />
        </div>
      </div>
    </BaseDialog>
  )
}
