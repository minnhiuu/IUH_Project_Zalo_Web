import { useMemo, useState } from 'react'
import { KeyRound, Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { useGroupMembersInfinite } from '../../../queries/use-queries'
import { useSendFriendRequest } from '@/features/friend/queries/use-mutations'
import {
  useRemoveMemberFromGroupMutation,
  usePromoteToAdminMutation,
  useDemoteFromAdminMutation
} from '../../../queries/use-mutations'
import { useChatText } from '../../../i18n/use-chat-text'
import { GroupMemberRole } from '@/constants/enum'
import { useDebounce } from '@/hooks/use-debounce'
import { MemberActionMenu } from './member-action-menu'
import type { GroupMemberListItemResponse } from '../../../schemas/chat.schema'

interface GroupMembersSectionProps {
  conversationId: string
  title: string
  membersCount: number
  addFriendLabel: string
  currentUserRole: GroupMemberRole
  onLeaveGroup: () => void
}

export function GroupMembersSection({
  conversationId,
  title,
  membersCount,
  addFriendLabel,
  currentUserRole,
  onLeaveGroup
}: GroupMembersSectionProps) {
  const { t } = useChatText()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGroupMembersInfinite(
    conversationId,
    debouncedQuery,
    true
  )
  const sendFriendRequest = useSendFriendRequest()
  const removeMemberMutation = useRemoveMemberFromGroupMutation()
  const promoteMutation = usePromoteToAdminMutation()
  const demoteMutation = useDemoteFromAdminMutation()

  const members = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data])

  const handleMenuAction = (
    action: 'leave' | 'add-deputy' | 'remove-deputy' | 'remove-member',
    member: GroupMemberListItemResponse
  ) => {
    if (action === 'remove-member') {
      removeMemberMutation.mutate({ conversationId, targetUserId: member.userId })
      return
    }

    if (action === 'leave') {
      onLeaveGroup()
      return
    }

    if (action === 'add-deputy') {
      promoteMutation.mutate({ conversationId, targetUserId: member.userId })
      return
    }

    if (action === 'remove-deputy') {
      demoteMutation.mutate({ conversationId, targetUserId: member.userId })
      return
    }
  }

  const renderMemberItem = (member: (typeof members)[number]) => {
    const roleLabel =
      member.role === GroupMemberRole.Owner
        ? String(t('chat.sidebarInfo.ownerRole'))
        : member.role === GroupMemberRole.Admin
          ? String(t('chat.sidebarInfo.adminRole'))
          : null

    return (
      <div
        key={member.userId}
        className='group px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors'
      >
        <div className='relative shrink-0'>
          <UserAvatar src={member.avatar} name={member.fullName} className='w-10 h-10 shrink-0' />
          {(member.role === GroupMemberRole.Owner || member.role === GroupMemberRole.Admin) && (
            <span className='member-role-key-badge absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-background'>
              <KeyRound
                strokeWidth={2.75}
                className={
                  member.role === GroupMemberRole.Owner
                    ? 'member-role-key-icon-owner w-2.5 h-2.5'
                    : 'member-role-key-icon-admin w-2.5 h-2.5'
                }
              />
            </span>
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-[15px] font-semibold text-foreground truncate'>
            {member.isCurrentUser ? String(t('chat.you')) : member.fullName}
          </p>
          {roleLabel && <p className='text-[12px] text-muted-foreground truncate'>{roleLabel}</p>}
        </div>
        <MemberActionMenu
          member={member}
          currentUserRole={currentUserRole}
          labels={{
            leaveGroup: String(t('chat.sidebarInfo.leaveGroup')),
            addDeputy: String(t('chat.sidebarInfo.addDeputy')),
            removeDeputy: String(t('chat.sidebarInfo.removeDeputy')),
            removeFromGroup: String(t('chat.sidebarInfo.removeFromGroup'))
          }}
          onAction={(action, selectedMember) => handleMenuAction(action, selectedMember)}
        />
        {!member.isCurrentUser && !member.isFriend && (
          <Button
            size={'lg'}
            variant={'secondary-blue'}
            disabled={sendFriendRequest.isPending}
            onClick={() => sendFriendRequest.mutate({ receiverId: member.userId })}
          >
            {addFriendLabel}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className='bg-background h-full flex flex-col min-h-0'>
      <div className='px-4 py-3 border-b border-border/50'>
        <h4 className='text-[15px] font-semibold text-foreground'>{`${title} (${membersCount})`}</h4>

        <div className='relative mt-3'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70' />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={String(t('chat.sidebarInfo.searchMemberPlaceholder'))}
            className='pl-9 h-9 rounded-full bg-muted/40 border-muted/60 text-[13.5px]'
          />
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto'>
        {isLoading ? (
          <div className='px-4 py-5 text-sm text-muted-foreground'>{String(t('chat.sidebarInfo.membersLoading'))}</div>
        ) : members.length === 0 ? (
          <div className='px-4 py-6 text-sm text-muted-foreground flex items-center gap-2'>
            <Users className='w-4 h-4' />
            {String(t('chat.sidebarInfo.noMatchingMembers'))}
          </div>
        ) : (
          members.map(renderMemberItem)
        )}
      </div>

      {hasNextPage && (
        <div className='px-4 py-2 border-t border-border/40'>
          <Button
            variant='secondary'
            className='w-full h-8 text-[13px]'
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}
