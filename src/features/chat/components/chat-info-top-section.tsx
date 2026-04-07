import { BellOff, Pencil, Pin, Settings, UserPlus } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from './group/group-avatar'
import { ActionButton } from '@/components/common/action-button'
import type { ConversationResponse } from '../schemas/chat.schema'
import { cn } from '@/lib/utils'

interface SidebarInfoText {
  muteNotifications: string
  pin: string
  addMember: string
  settings: string
  createGroup: string
  user: string
}

interface ChatInfoTopSectionProps {
  conversation: ConversationResponse
  isGroup: boolean
  text: SidebarInfoText
  onAvatarClick?: () => void
  onRenameClick?: () => void
  onOpenAddMember: () => void
  onOpenCreateGroup: () => void
  onOpenManagement: () => void
}

export function ChatInfoTopSection({
  conversation,
  isGroup,
  text,
  onAvatarClick,
  onRenameClick,
  onOpenAddMember,
  onOpenCreateGroup,
  onOpenManagement
}: ChatInfoTopSectionProps) {
  return (
    <div className='bg-background p-6 flex flex-col items-center border-b border-border/50 shadow-sm'>
      <div className='relative group'>
        {isGroup && !conversation.avatar ? (
          <div
            onClick={onAvatarClick}
            className='cursor-pointer hover:ring-4 hover:ring-primary/10 rounded-full transition-all'
          >
            <GroupAvatar
              avatars={conversation.members?.map((m) => m.avatar) || []}
              names={conversation.members?.map((m) => m.fullName) || []}
              count={conversation.members?.length || 0}
              size='xl'
            />
          </div>
        ) : (
          <div
            onClick={onAvatarClick}
            className='cursor-pointer hover:ring-4 hover:ring-primary/10 rounded-full transition-all'
          >
            <UserAvatar
              src={conversation.avatar}
              name={conversation.name || text.user}
              className='w-20 h-20 shadow-md'
            />
          </div>
        )}
      </div>

      <div className='mt-4 flex items-center space-x-2 overflow-hidden w-full justify-center'>
        <h3 className='font-bold text-[18px] text-foreground truncate'>{conversation.name}</h3>
        <ActionButton icon={<Pencil />} onClick={onRenameClick} size='sm' iconSize='sm' />
      </div>

      <div className={cn('w-full mt-6 px-1 flex justify-center', isGroup ? 'gap-2' : 'gap-8')}>
        <div className='flex flex-col items-center space-y-1.5 w-18'>
          <ActionButton icon={<BellOff />} size='lg' iconSize='lg' />
          <span className='text-[12px] text-foreground font-medium text-center'>{text.muteNotifications}</span>
        </div>
        <div className='flex flex-col items-center space-y-1.5 w-18'>
          <ActionButton icon={<Pin />} size='lg' iconSize='lg' />
          <span className='text-[12px] text-foreground font-medium text-center'>{text.pin}</span>
        </div>
        {isGroup ? (
          <>
            <div className='flex flex-col items-center space-y-1.5 w-18'>
              <ActionButton icon={<UserPlus />} size='lg' iconSize='lg' onClick={onOpenAddMember} />
              <span className='text-[12px] text-foreground font-medium text-center leading-tight'>
                {text.addMember}
              </span>
            </div>
            <div className='flex flex-col items-center space-y-1.5 w-18'>
              <ActionButton icon={<Settings />} size='lg' iconSize='lg' onClick={onOpenManagement} />
              <span className='text-[12px] text-foreground font-medium text-center leading-tight'>{text.settings}</span>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center space-y-1.5 w-18'>
            <ActionButton icon={<UserPlus />} size='lg' iconSize='lg' onClick={onOpenCreateGroup} />
            <span className='text-[12px] text-foreground font-medium text-center leading-tight'>
              {text.createGroup}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
