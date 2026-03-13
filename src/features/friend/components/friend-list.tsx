import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { FriendListItem } from './friend-list-item'
import { useFriendText } from '../i18n/use-friend-text'
import { useMyFriends, useUnfriend } from '../queries'
import { SearchEmpty } from '@/components/common/search-empty'
import type { FriendResponse } from '../schemas/friend.schema'
import { OthersProfileDialog } from '@/features/user'

type SortOption = 'name-asc' | 'name-desc' | 'recent'
type FilterOption = 'all' | 'new'

// Helper to get display letter for grouping
function getDisplayLetter(name: string): string {
  const firstChar = name.charAt(0).toUpperCase()
  // Check if it's a letter
  if (/[A-Z]/.test(firstChar)) return firstChar
  // For Vietnamese characters, try to normalize
  const normalized = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  if (/[A-Z]/.test(normalized)) return normalized
  return '#'
}

// Check if friend is recent (within last 7 days)
function isRecentFriend(friendsSince: string): boolean {
  const friendDate = new Date(friendsSince)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - friendDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

export function FriendList() {
  const { text } = useFriendText()
  const { data: friends, isLoading } = useMyFriends()
  const unfriendMutation = useUnfriend()

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [sortBy] = useState<SortOption>('name-asc')
  const [filterBy] = useState<FilterOption>('all')

  // Filter and sort friends
  const processedFriends = useMemo(() => {
    if (!friends) return { newFriends: [], groupedFriends: {} }

    let filtered = [...friends]

    // Separate new friends
    const newFriends = filtered.filter((f) => isRecentFriend(f.friendsSince))
    const otherFriends = filterBy === 'new' ? [] : filtered.filter((f) => !isRecentFriend(f.friendsSince))

    // Sort
    const sortFn = (a: FriendResponse, b: FriendResponse) => {
      switch (sortBy) {
        case 'name-asc':
          return a.userName.localeCompare(b.userName, 'vi')
        case 'name-desc':
          return b.userName.localeCompare(a.userName, 'vi')
        case 'recent':
          return new Date(b.friendsSince).getTime() - new Date(a.friendsSince).getTime()
        default:
          return 0
      }
    }

    newFriends.sort(sortFn)
    otherFriends.sort(sortFn)

    // Group other friends by first letter
    const groupedFriends: Record<string, FriendResponse[]> = {}
    otherFriends.forEach((friend) => {
      const letter = getDisplayLetter(friend.userName)
      if (!groupedFriends[letter]) {
        groupedFriends[letter] = []
      }
      groupedFriends[letter].push(friend)
    })

    return { newFriends, groupedFriends }
  }, [friends, sortBy, filterBy])

  const totalCount = friends?.length ?? 0
  const sortedLetters = Object.keys(processedFriends.groupedFriends).sort((a, b) =>
    a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'vi')
  )

  const handleUnfriend = (friend: FriendResponse) => {
    unfriendMutation.mutate(friend.userId)
  }

  const handleViewProfile = (friend: FriendResponse) => {
    setSelectedUserId(friend.userId)
  }

  return (
    <div className='flex-1 flex flex-col h-full overflow-hidden bg-background dark:bg-background'>
      {/* Header */}
      <div className='bg-background border-b border-border px-4 py-3 shrink-0'>
        <h1 className='text-base font-semibold text-foreground'>{'Danh sách bạn bè'}</h1>
      </div>

      {/* Subheader with count */}
      <div className='bg-background px-4 py-2 border-b border-border shrink-0'>
        <span className='text-xs text-muted-foreground font-medium'>
          Bạn bè ({totalCount})
        </span>
      </div>

      {/* Friend List */}
      <div className='flex-1 overflow-y-auto bg-background'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3 px-4 py-3'>
                <Skeleton className='w-12 h-12 rounded-full shrink-0' />
                <Skeleton className='h-4 flex-1 max-w-50' />
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <SearchEmpty title={text.empty.friends} />
        ) : (
          <>
            {/* New Friends Section */}
            {processedFriends.newFriends.length > 0 && (
              <div>
                <div className='px-4 py-2 bg-muted/30'>
                  <h3 className='text-xs font-semibold text-foreground'>{text.sections.newFriends}</h3>
                </div>
                {processedFriends.newFriends.map((friend) => (
                  <FriendListItem
                    key={friend.userId}
                    friend={friend}
                    onViewProfile={handleViewProfile}
                    onUnfriend={handleUnfriend}
                  />
                ))}
              </div>
            )}

            {/* Grouped Friends by Letter */}
            {sortedLetters.map((letter) => (
              <div key={letter}>
                <div className='px-4 py-2 bg-muted/30'>
                  <h3 className='text-xs font-semibold text-foreground'>{letter}</h3>
                </div>
                {processedFriends.groupedFriends[letter].map((friend) => (
                  <FriendListItem
                    key={friend.userId}
                    friend={friend}
                    onViewProfile={handleViewProfile}
                    onUnfriend={handleUnfriend}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Profile Dialog */}
      <OthersProfileDialog
        userId={selectedUserId ?? undefined}
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />
    </div>
  )
}
