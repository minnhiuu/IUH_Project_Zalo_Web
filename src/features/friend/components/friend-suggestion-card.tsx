import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { useFriendText } from '../i18n/use-friend-text'
import { useAcceptFriendRequest, useCancelFriendRequest, useFriendshipStatus } from '../queries'
import type { FriendSuggestionResponse } from '../schemas/friend.schema'
import { FriendStatus } from '../schemas/friend.schema'
import { useAuthContext } from '@/features/auth/context/auth-context'

interface FriendSuggestionCardProps {
  suggestion: FriendSuggestionResponse
  onAddFriend: () => void
  onSkip: () => void
  onViewProfile?: () => void
  isAdding?: boolean
}

type SuggestionPrimaryAction = 'add' | 'accept' | 'recall' | null

export function FriendSuggestionCard({
  suggestion,
  onAddFriend,
  onSkip,
  onViewProfile,
  isAdding
}: FriendSuggestionCardProps) {
  const { text } = useFriendText()
  const { user: currentUser } = useAuthContext()
  const { data: friendshipStatus, isLoading: isLoadingStatus } = useFriendshipStatus(suggestion.userId)
  const acceptRequestMutation = useAcceptFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()

  const getPrimaryButtonState = () => {
    if (isLoadingStatus) {
      return { label: '...', disabled: true, action: null as SuggestionPrimaryAction }
    }

    if (!friendshipStatus || !friendshipStatus.status) {
      return { label: text.actions.addFriend, disabled: false, action: 'add' as const }
    }

    switch (friendshipStatus.status) {
      case FriendStatus.Accepted:
        return { label: text.status.accepted, disabled: true, action: null as SuggestionPrimaryAction }
      case FriendStatus.Pending: {
        const sentByMe = friendshipStatus.requestedBy === currentUser?.id
        if (sentByMe) {
          return { label: text.actions.recall, disabled: false, action: 'recall' as const }
        }
        return { label: text.actions.accept, disabled: false, action: 'accept' as const }
      }
      case FriendStatus.Cancelled:
      case FriendStatus.Declined:
      default:
        return { label: text.actions.addFriend, disabled: false, action: 'add' as const }
    }
  }

  const handlePrimaryAction = () => {
    const state = getPrimaryButtonState()

    switch (state.action) {
      case 'add':
        onAddFriend()
        break
      case 'accept':
        if (friendshipStatus?.friendshipId) {
          acceptRequestMutation.mutate(friendshipStatus.friendshipId)
        }
        break
      case 'recall':
        if (friendshipStatus?.friendshipId) {
          cancelRequestMutation.mutate(friendshipStatus.friendshipId)
        }
        break
    }
  }

  const primaryButtonState = getPrimaryButtonState()
  const isPrimaryPending = acceptRequestMutation.isPending || cancelRequestMutation.isPending || isAdding

  const getMutualText = () => {
    const parts: string[] = []
    if (suggestion.mutualFriendsCount && suggestion.mutualFriendsCount > 0) {
      parts.push(text.source.mutualFriendsSource(suggestion.mutualFriendsCount))
    }
    if (suggestion.sharedGroupsCount && suggestion.sharedGroupsCount > 0) {
      parts.push(text.source.mutualGroups(suggestion.sharedGroupsCount))
    }
    return parts.length > 0 ? parts.join(' · ') : null
  }

  // Determine the primary suggestion source badge
  const getSuggestionSource = () => {
    const hasContact = suggestion.contactScore != null && suggestion.contactScore > 0
    const hasMutualFriends = (suggestion.mutualFriendsCount ?? 0) > 0
    const hasGroups = (suggestion.sharedGroupsCount ?? 0) > 0

    // Priority: contact > mutual friends > shared groups
    if (hasContact) return { label: text.source.phoneContact, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
    if (hasMutualFriends) return { label: text.source.friendSuggestion, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
    if (hasGroups) return { label: text.source.mutualGroups(suggestion.sharedGroupsCount!), color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' }
    return null
  }

  const mutualText = getMutualText()
  const suggestionSource = getSuggestionSource()

  return (
    <div className='bg-background rounded-xl border border-(--friend-card-border) p-4 flex flex-col'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='cursor-pointer' onClick={onViewProfile}>
          <UserAvatar src={suggestion.avatar} name={suggestion.fullName} className='w-14 h-14 shrink-0' />
        </div>
        <div className='flex-1 min-w-0'>
          <h4
            className='text-[16px] font-semibold text-foreground truncate cursor-pointer hover:underline'
            onClick={onViewProfile}
          >
            {suggestion.fullName}
          </h4>
          {mutualText && <p className='text-[13px] text-muted-foreground'>{mutualText}</p>}
          {suggestionSource && (
            <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${suggestionSource.color}`}>
              {suggestionSource.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-2 mt-4'>
        <Button
          variant='secondary'
          onClick={onSkip}
          className='flex-1 h-9 text-[13px] font-semibold bg-(--friend-btn-muted) hover:bg-(--friend-btn-muted-hover) text-foreground/90'
        >
          {text.actions.skip}
        </Button>
        <Button
          onClick={handlePrimaryAction}
          disabled={primaryButtonState.disabled || isPrimaryPending}
          className='flex-1 h-9 text-[13px] font-semibold bg-(--friend-btn-primary) hover:bg-(--friend-btn-primary-hover) text-(--friend-btn-primary-text)'
        >
          {primaryButtonState.label}
        </Button>
      </div>
    </div>
  )
}
