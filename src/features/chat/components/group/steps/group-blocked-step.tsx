import { useState, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupMemberRole } from '@/constants/enum'
import { useChatText } from '../../../i18n/use-chat-text'
import { MemberSelectionDialog } from '../dialogs/member-selection-dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { showSuccessToast, showWarningToast } from '@/utils/toast'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useBlockedMembersInfiniteQuery, useBlockCandidatesInfiniteQuery } from '../../../queries/use-queries'
import { useBlockMemberMutation, useUnblockMemberMutation } from '../../../queries/use-mutations'

interface GroupBlockedStepProps {
  currentUserRole: GroupMemberRole
  conversationId: string
}

export function GroupBlockedStep({ currentUserRole, conversationId }: GroupBlockedStepProps) {
  const { text: tg } = useChatText()
  const labels = tg['group-info-dialog'].actions
  const isOwnerOrAdmin = currentUserRole === GroupMemberRole.Owner || currentUserRole === GroupMemberRole.Admin
  const [isSelectionOpen, setIsSelectionOpen] = useState(false)

  const { data, isLoading } = useBlockedMembersInfiniteQuery(conversationId)
  const { data: blockCandidatesData } = useBlockCandidatesInfiniteQuery(conversationId, '', isOwnerOrAdmin)
  const { mutate: blockMember, isPending: isBlocking } = useBlockMemberMutation()
  const { mutate: unblockMember } = useUnblockMemberMutation()
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null)

  const blockedMembers = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || []
  }, [data])

  const hasBlockCandidates = useMemo(() => {
    if (!blockCandidatesData) return true // assume available while loading
    return blockCandidatesData.pages.some((page) => (page.data?.length ?? 0) > 0)
  }, [blockCandidatesData])

  const handleOpenBlockDialog = () => {
    if (!hasBlockCandidates) {
      showWarningToast(tg.toasts.noBlockCandidates)
      return
    }
    setIsSelectionOpen(true)
  }

  const handleBlockMembers = async (selectedIds: string[]) => {
    // Calling API in loop as the provided API is single-user
    for (const userId of selectedIds) {
      await new Promise<void>((resolve) => {
        blockMember(
          { conversationId, targetUserId: userId },
          {
            onSettled: () => resolve()
          }
        )
      })
    }
    setIsSelectionOpen(false)
    showSuccessToast(tg.toasts.blockSuccess)
  }

  const handleUnblock = (userId: string) => {
    console.log('Unblocking user:', userId, 'in conversation:', conversationId)
    setUnblockingUserId(userId)
    unblockMember(
      { conversationId, targetUserId: userId },
      {
        onSuccess: () => {
          showSuccessToast(tg.toasts.unblockSuccess)
        },
        onSettled: () => {
          setUnblockingUserId(null)
        }
      }
    )
  }

  return (
    <div className='flex flex-col h-full bg-background'>
      <ScrollArea className='flex-1'>
        <div className='p-4 space-y-4'>
          <p className='text-[14px] leading-relaxed text-muted-foreground/80 px-1'>{labels.blockedMembersDesc}</p>

          {isOwnerOrAdmin && (
            <Button
              onClick={handleOpenBlockDialog}
              className={cn(
                'w-full h-10 font-bold text-[14px] rounded-[4px] border-none transition-colors',
                'bg-destructive-subtle hover:bg-destructive-hover text-destructive-subtle-text',
                'dark:bg-destructive dark:hover:bg-destructive/90 dark:text-white'
              )}
            >
              {labels.blockMember}
            </Button>
          )}

          {isLoading ? (
            <div className='flex justify-center p-8'>
              <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
            </div>
          ) : blockedMembers.length > 0 ? (
            <div className='flex flex-col space-y-4 pt-2'>
              <Separator className='opacity-50' />
              <div className='flex items-center justify-between px-1'>
                <h3 className='text-[14.5px] font-bold'>{labels.blockedMembersCount(blockedMembers.length)}</h3>
              </div>
              <div className='grow space-y-4'>
                {blockedMembers.map((member) => (
                  <div key={member.userId} className='flex items-center justify-between group px-1'>
                    <div className='flex items-center gap-3'>
                      <UserAvatar
                        name={member.fullName}
                        src={member.avatar || undefined}
                        className='w-10 h-10 shadow-sm border border-border/10'
                      />
                      <span className='text-[15px] font-medium'>{member.fullName}</span>
                    </div>
                    {isOwnerOrAdmin && (
                      <Button
                        variant='secondary'
                        size='sm'
                        disabled={unblockingUserId === member.userId}
                        onClick={() => handleUnblock(member.userId)}
                        className='h-8 px-4 rounded-[4px] font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors'
                      >
                        {unblockingUserId === member.userId ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          labels.unblock
                        )}
                      </Button>
                    )}
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
        confirmText={labels.confirmBlock}
        onConfirm={handleBlockMembers}
        conversationId={conversationId}
        type='block-members'
        isPending={isBlocking}
      />
    </div>
  )
}
