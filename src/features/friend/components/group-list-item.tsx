import { MoreHorizontal, LogOut } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from '@/components/common/group-avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useFriendText } from '../i18n/use-friend-text'
import { LeaveGroupDialog } from '@/features/chat/components/group/dialogs/leave-group-dialog'
import { TransferOwnerDialog } from '@/features/chat/components/group/dialogs/transfer-owner-dialog'
import { useChatText } from '@/features/chat/i18n/use-chat-text'
import { useAuth } from '@/features/auth'
import { GroupMemberRole } from '@/constants/enum'
import type { ConversationResponse } from '@/features/chat/schemas/chat.schema'

interface GroupListItemProps {
  group: ConversationResponse
  onOpenChat?: (group: ConversationResponse) => void
}

export function GroupListItem({ group, onOpenChat }: GroupListItemProps) {
  const { text } = useFriendText()
  const { text: chatText } = useChatText()
  const { user } = useAuth()
  
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedTransferUserId, setSelectedTransferUserId] = useState<string | null>(null)

  const members = group.members || []
  const memberCount = members.filter((m) => m.role !== undefined || m.userId).length ?? 0
  const currentUserMember = members.find((m) => m.userId === user?.id)
  const isOwner = currentUserMember?.role === GroupMemberRole.Owner

  const handleLeaveClick = () => {
    if (isOwner) {
      setIsTransferDialogOpen(true)
    } else {
      setIsLeaveDialogOpen(true)
    }
  }

  const handleTransferSelect = (targetUserId: string) => {
    setSelectedTransferUserId(targetUserId)
    setIsTransferDialogOpen(false)
    setIsLeaveDialogOpen(true)
  }

  return (
    <>
      <div
        onClick={() => onOpenChat?.(group)}
        className='flex items-center gap-3 px-2 h-[72px] hover:bg-muted transition-colors group cursor-pointer'
      >
        {group.avatar ? (
          <UserAvatar src={group.avatar} name={group.name ?? 'Group'} className='w-12 h-12 shrink-0' />
        ) : (
          <GroupAvatar
            avatars={members.map((m) => m.avatar)}
            names={members.map((m) => m.fullName)}
            count={memberCount}
            size='lg'
            className='shrink-0'
          />
        )}

        <div className='flex-1 min-w-0'>
          <h4 className='text-[15px] font-semibold text-text-primary truncate'>{group.name ?? 'Unnamed Group'}</h4>
          {memberCount > 0 && (
            <div className='flex items-center gap-1 mt-0.5'>
              <p className='text-[13px] text-text-secondary font-normal'>
                {text.groupList.memberCount(memberCount)}
              </p>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 hover:bg-muted',
                'focus:opacity-100 focus:outline-none'
              )}
            >
              <MoreHorizontal className='w-5 h-5 text-text-secondary' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48' onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={(e) => {
                e.stopPropagation()
                handleLeaveClick()
              }}
            >
              <LogOut className='w-4 h-4 mr-2' />
              {chatText['group-info-dialog'].leaveGroup}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TransferOwnerDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        members={group.members || []}
        currentUserId={user?.id}
        onSelect={handleTransferSelect}
      />

      <LeaveGroupDialog
        open={isLeaveDialogOpen}
        onOpenChange={(open) => {
          setIsLeaveDialogOpen(open)
          if (!open) setSelectedTransferUserId(null)
        }}
        conversationId={group.id}
        transferTargetUserId={selectedTransferUserId}
      />
    </>
  )
}
