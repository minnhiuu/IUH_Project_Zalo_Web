import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/common/user-avatar'
import type { SearchMemberResponse } from '../../../schemas/chat.schema'
import { Check } from 'lucide-react'
import { useChatText } from '../../../i18n/use-chat-text'

interface MemberItemProps {
  member: SearchMemberResponse
  isSelected: boolean
  onToggle: () => void
}

export const MemberItem = ({ member, isSelected, onToggle }: MemberItemProps) => {
  const { text } = useChatText()
  const tg = text['create-group-dialog']
  const isAlreadyMember = member.isAlreadyMember

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors group ${
        isAlreadyMember ? 'cursor-default opacity-90' : 'cursor-pointer'
      }`}
      onClick={isAlreadyMember ? undefined : onToggle}
    >
      <div className='flex items-center justify-center w-5 h-5'>
        {isAlreadyMember ? (
          <div className='w-4.5 h-4.5 rounded-full bg-dialog-selection-btn-disabled-bg flex items-center justify-center'>
            <Check className='w-3 h-3 text-white' />
          </div>
        ) : (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className='rounded-full w-4.5 h-4.5 border-muted-foreground/30'
          />
        )}
      </div>
      <UserAvatar name={member.fullName} src={member.avatar} className='w-10 h-10 shadow-sm border border-border/10' />
      <div className='flex flex-col min-w-0'>
        <span className='text-[14px] font-normal text-foreground truncate'>{member.fullName}</span>
        {isAlreadyMember ? (
          <span className='text-[12px] text-muted-foreground/70 truncate'>{tg.alreadyJoined}</span>
        ) : member.phoneNumber ? (
          <span className='text-[12px] text-muted-foreground/60 truncate'>{member.phoneNumber}</span>
        ) : null}
      </div>
    </div>
  )
}
