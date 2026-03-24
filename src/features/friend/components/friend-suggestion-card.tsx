import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { useFriendText } from '../i18n/use-friend-text'

export interface FriendSuggestion {
  id: string
  userId: string
  userName: string
  userAvatar: string
  mutualGroupsCount?: number
  mutualFriendsCount?: number
}

interface FriendSuggestionCardProps {
  suggestion: FriendSuggestion
  onAddFriend: () => void
  onSkip: () => void
  onViewProfile?: () => void
  isAdding?: boolean
}

export function FriendSuggestionCard({
  suggestion,
  onAddFriend,
  onSkip,
  onViewProfile,
  isAdding
}: FriendSuggestionCardProps) {
  const { text } = useFriendText()

  const getMutualText = () => {
    if (suggestion.mutualGroupsCount && suggestion.mutualGroupsCount > 0) {
      return text.source.mutualGroups(suggestion.mutualGroupsCount)
    }
    if (suggestion.mutualFriendsCount && suggestion.mutualFriendsCount > 0) {
      return text.mutualFriends(suggestion.mutualFriendsCount)
    }
    return null
  }

  const mutualText = getMutualText()

  return (
    <div className='bg-background rounded-lg border border-border p-4 flex flex-col'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='cursor-pointer' onClick={onViewProfile}>
          <UserAvatar src={suggestion.userAvatar} name={suggestion.userName} className='w-12 h-12 shrink-0' />
        </div>
        <div className='flex-1 min-w-0'>
          <h4
            className='text-[15px] font-semibold text-foreground truncate cursor-pointer hover:underline'
            onClick={onViewProfile}
          >
            {suggestion.userName}
          </h4>
          {mutualText && <p className='text-[13px] text-muted-foreground'>{mutualText}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-2 mt-4'>
        <Button variant='outline' onClick={onSkip} className='flex-1 h-9 text-[13px] font-medium'>
          {text.actions.skip}
        </Button>
        <Button onClick={onAddFriend} disabled={isAdding} className='flex-1 h-9 text-[13px] font-medium'>
          {text.actions.addFriend}
        </Button>
      </div>
    </div>
  )
}
