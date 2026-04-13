import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/common/user-avatar'
import type { SearchMemberResponse } from '../../../schemas/chat.schema'
import { Check } from 'lucide-react'
import { MemberRoleBadge } from './member-role-badge'
import { GroupMemberRole } from '@/constants/enum'
import { useChatText } from '../../../i18n/use-chat-text'

interface MemberItemProps {
  member: SearchMemberResponse
  isSelected: boolean
  onToggle: () => void
  selectionMode?: 'checkbox' | 'radio' | 'none'
  disabled?: boolean
  showSubtitle?: boolean
  hideAlreadyJoined?: boolean
}

export const MemberItem = ({
  member,
  isSelected,
  onToggle,
  selectionMode = 'checkbox',
  disabled = false,
  showSubtitle = true,
  hideAlreadyJoined = false
}: MemberItemProps) => {
  const { text } = useChatText()
  const tg = text['create-group-dialog']
  const isActuallyAlreadyMember = (member.isAlreadyMember && !hideAlreadyJoined) || disabled

  return (
     <div
       className={`flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors group ${
         isActuallyAlreadyMember ? 'cursor-default opacity-90' : 'cursor-pointer'
       }`}
       onClick={isActuallyAlreadyMember ? undefined : onToggle}
     >
      <div className='flex items-center justify-center w-5 h-5'>
        {member.isAlreadyMember && !hideAlreadyJoined ? (
          <div className='w-4.5 h-4.5 rounded-full bg-dialog-selection-btn-disabled-bg flex items-center justify-center'>
            <Check className='w-3 h-3 text-white' />
          </div>
        ) : selectionMode === 'radio' ? (
          <div
            className={`w-4.5 h-4.5 rounded-full border border-muted-foreground/30 flex items-center justify-center transition-colors ${
              isSelected ? 'border-primary bg-primary' : 'bg-transparent'
            }`}
          >
            {isSelected && <div className='w-2 h-2 rounded-full bg-white shadow-sm' />}
          </div>
        ) : selectionMode === 'checkbox' ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className='rounded-full w-4.5 h-4.5 border-muted-foreground/30'
          />
        ) : null}
      </div>
      <div className='relative shrink-0'>
        <UserAvatar
          name={member.fullName}
          src={member.avatar}
          className='w-10 h-10 shadow-sm border border-border/10'
        />
        <MemberRoleBadge role={member.role} />
      </div>
      <div className='flex flex-col min-w-0'>
        <span className='text-[15px] font-semibold text-foreground truncate'>{member.fullName}</span>
        {showSubtitle && (
          <span className='text-[12px] text-muted-foreground truncate'>
            {member.isAlreadyMember && !member.role && !hideAlreadyJoined ? tg.alreadyJoined : null}
            {member.role === 'ADMIN' || member.role === GroupMemberRole.Admin
              ? text['sidebarInfo'].adminRole
              : member.role === 'OWNER' || member.role === GroupMemberRole.Owner
                ? text['sidebarInfo'].ownerRole
                : null}
          </span>
        )}
      </div>
    </div>
  )
}
