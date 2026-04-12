import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupMemberRole } from '@/constants/enum'
import { useChatText } from '../../../i18n/use-chat-text'
import { MemberSelectionDialog } from '../dialogs/member-selection-dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { showSimpleToast } from '@/utils/toast'
import { Separator } from '@/components/ui/separator'

interface GroupBlockedStepProps {
  currentUserRole: GroupMemberRole
  conversationId: string
}

interface BlockedMember {
  userId: string
  fullName: string
  avatar: string
}

export function GroupBlockedStep({ currentUserRole, conversationId }: GroupBlockedStepProps) {
  const { text: tg } = useChatText()
  const labels = tg['group-info-dialog'].actions
  const isOwnerOrAdmin = currentUserRole === GroupMemberRole.Owner || currentUserRole === GroupMemberRole.Admin
  const [isSelectionOpen, setIsSelectionOpen] = useState(false)

  // Mock data for blocked members as requested
  const [blockedMembers, setBlockedMembers] = useState<BlockedMember[]>([
    {
      userId: 'mock-1',
      fullName: 'Đào Linh',
      avatar: 'https://i.pravatar.cc/150?u=mock-1'
    }
  ])

  const handleBlockMembers = (selectedIds: string[]) => {
    // UI logic only: simulating adding to block list
    console.log('Blocked members (UI simulation):', selectedIds)
    setIsSelectionOpen(false)
  }

  const handleUnblock = (userId: string) => {
    setBlockedMembers((prev) => prev.filter((m) => m.userId !== userId))
    showSimpleToast('Unblocked successfully')
  }

  return (
    <div className='flex flex-col h-full bg-background'>
      <ScrollArea className='flex-1'>
        <div className='p-4 space-y-4'>
          <p className='text-[14px] leading-relaxed text-muted-foreground/80 px-1'>{labels.blockedMembersDesc}</p>

          {isOwnerOrAdmin && (
            <Button
              onClick={() => setIsSelectionOpen(true)}
              className='w-full h-10 font-bold text-[14px] rounded-[4px] bg-destructive-subtle hover:bg-destructive-hover text-destructive-subtle-text dark:bg-destructive dark:hover:bg-destructive/90 dark:text-white border-none transition-colors'
            >
              {labels.blockMember}
            </Button>
          )}

          {blockedMembers.length > 0 ? (
            <div className='flex flex-col space-y-4 pt-2'>
              <Separator className='opacity-50' />
              <h3 className='text-[14.5px] font-bold px-1'>Blocked members ({blockedMembers.length})</h3>
              <div className='space-y-3'>
                {blockedMembers.map((member) => (
                  <div key={member.userId} className='flex items-center justify-between group px-1'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='w-10 h-10'>
                        <AvatarImage src={member.avatar} alt={member.fullName} />
                        <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className='text-[15px] font-medium'>{member.fullName}</span>
                    </div>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => handleUnblock(member.userId)}
                      className='h-8 px-4 rounded-[4px] font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors'
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center p-8 pt-12 text-center opacity-60'>
              <div className='relative w-28 h-28 mb-8'>
                <User strokeWidth={1.2} className='w-full h-full text-empty-state-icon' />
                <div className='absolute bottom-2 right-2 bg-background rounded-full p-1'>
                  <Lock strokeWidth={2.5} className='w-7 h-7 text-empty-state-lock' />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <MemberSelectionDialog
        isOpen={isSelectionOpen}
        onClose={() => setIsSelectionOpen(false)}
        title={labels.blockMember}
        confirmText='Block members'
        onConfirm={handleBlockMembers}
        conversationId={conversationId}
      />
    </div>
  )
}
