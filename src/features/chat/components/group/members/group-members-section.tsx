import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { useGroupMembersInfinite } from '../../../queries/use-queries'
import { useBatchFriendshipStatus } from '@/features/friend/queries/use-queries'
import { useSendFriendRequest } from '@/features/friend/queries/use-mutations'
import { usePromoteToAdminMutation, useDemoteFromAdminMutation } from '../../../queries/use-mutations'
import { useChatText } from '../../../i18n/use-chat-text'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { GroupMemberRole } from '@/constants/enum'
import { useDebounce } from '@/hooks/use-debounce'
import { BONDHUB_AI } from '@/constants/system'
import { MemberActionMenu } from './member-action-menu'
import { MemberRoleBadge } from './member-role-badge'
import type { GroupMemberListItemResponse } from '../../../schemas/chat.schema'
import { RemoveMemberDialog } from './remove-member-dialog'
import { AddFriendConfirmDialog } from '@/features/friend/components/add-friend-confirm-dialog'
import { useGetOrCreateConversationMutation } from '../../../queries/use-mutations'
import { useNavigate } from 'react-router'
import { useFriendText } from '@/features/friend/i18n/use-friend-text'
import type { UserSummaryResponse } from '@/shared/user/user-summary'

interface GroupMembersSectionProps {
  conversationId: string
  title: string
  membersCount: number
  addFriendLabel: string
  currentUserRole: GroupMemberRole
  onLeaveGroup: () => void
  onMemberClick?: (member: GroupMemberListItemResponse) => void
}

export function GroupMembersSection({
  conversationId,
  title,
  membersCount,
  addFriendLabel,
  currentUserRole,
  onLeaveGroup,
  onMemberClick
}: GroupMembersSectionProps) {
  const { t } = useChatText()
  const { user } = useAuth()
  const currentUserId = user?.id ? String(user.id) : ''
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGroupMembersInfinite(
    conversationId,
    debouncedQuery,
    true
  )
  const sendFriendRequest = useSendFriendRequest()
  const promoteMutation = usePromoteToAdminMutation()
  const demoteMutation = useDemoteFromAdminMutation()

  const [targetMember, setTargetMember] = useState<GroupMemberListItemResponse | null>(null)
  const [removeOpen, setRemoveOpen] = useState(false)

  const [addFriendUser, setAddFriendUser] = useState<UserSummaryResponse | null>(null)
  const [addFriendOpen, setAddFriendOpen] = useState(false)
  const [sentRequestUserIds, setSentRequestUserIds] = useState<Set<string>>(new Set())

  const { text: friendText } = useFriendText()
  const navigate = useNavigate()
  const getOrCreateMutation = useGetOrCreateConversationMutation()

  const members = useMemo(
    () => (data?.pages.flatMap((page) => page.data) ?? []).filter((member) => member.userId !== BONDHUB_AI.userId),
    [data]
  )

  const checkIds = useMemo(() => {
    return members.filter((m) => !m.isFriend && !m.isCurrentUser).map((m) => m.userId)
  }, [members])

  const { data: batchStatuses } = useBatchFriendshipStatus(checkIds, checkIds.length > 0)

  const handleMenuAction = (
    action: 'leave' | 'add-deputy' | 'remove-deputy' | 'remove-member',
    member: GroupMemberListItemResponse
  ) => {
    if (action === 'remove-member') {
      setTargetMember(member)
      setRemoveOpen(true)
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

    const joinLabel =
      member.joinMethod === 'JOIN_BY_LINK'
        ? String(t('chat.sidebarInfo.joinedByLink'))
        : member.joinMethod === 'ADDED_BY_MEMBER' && member.addedBy
          ? member.addedBy === currentUserId
            ? String(t('chat.sidebarInfo.addedByYou'))
            : member.addedByName
              ? String(t('chat.sidebarInfo.addedBy', { name: member.addedByName }))
              : null
          : null

    const subtitleLabel = roleLabel ? roleLabel : joinLabel

    return (
      <div
        key={member.userId}
        className='group px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors'
      >
        <button
          type='button'
          onClick={() => onMemberClick?.(member)}
          className='flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer'
        >
          <div className='relative shrink-0'>
            <UserAvatar src={member.avatar} name={member.fullName} className='w-10 h-10 shrink-0' />
            <MemberRoleBadge role={member.role} />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-[15px] font-semibold text-foreground truncate'>
              {member.isCurrentUser ? String(t('chat.you')) : member.fullName}
            </p>
            {subtitleLabel && <p className='text-[12px] text-muted-foreground truncate'>{subtitleLabel}</p>}
          </div>
        </button>

        <div className='flex items-center gap-2 shrink-0'>
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
          {!member.isCurrentUser && (
            <>
          {!member.isFriend && batchStatuses?.[member.userId] !== 'ACCEPTED' && (
            sentRequestUserIds.has(member.userId) || batchStatuses?.[member.userId] === 'PENDING' ? (
              <Button
                size={'lg'}
                variant={'outline-blue'}
                disabled={getOrCreateMutation.isPending}
                onClick={() => {
                  getOrCreateMutation.mutate(member.userId, {
                    onSuccess: (conv) => navigate(`/chat/${conv.id}`)
                  })
                }}
              >
                {friendText.actions.message}
              </Button>
            ) : (
              <Button
                size={'lg'}
                variant={'secondary-blue'}
                disabled={sendFriendRequest.isPending}
                onClick={() => {
                  setAddFriendUser({
                    id: member.userId,
                    fullName: member.fullName,
                    avatar: member.avatar ?? '',
                    phoneNumber: member.phoneNumber ?? ''
                  })
                  setAddFriendOpen(true)
                }}
              >
                {addFriendLabel}
              </Button>
                )
              )}
            </>
          )}
        </div>
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

      {targetMember && (
        <RemoveMemberDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          conversationId={conversationId}
          targetUserId={targetMember.userId}
        />
      )}
      {addFriendUser && (
        <AddFriendConfirmDialog
          open={addFriendOpen}
          onOpenChange={setAddFriendOpen}
          user={addFriendUser}
          onSuccess={() => {
            if (addFriendUser) {
              setSentRequestUserIds((prev) => new Set(prev).add(addFriendUser.id))
            }
          }}
        />
      )}
    </div>
  )
}
