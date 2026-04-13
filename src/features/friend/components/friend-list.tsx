import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { FriendListItem } from './friend-list-item'
import { useFriendText } from '../i18n/use-friend-text'
import { useMyFriends, useUnfriend } from '../queries'
import { SearchEmpty } from '@/components/common/search-empty'
import type { FriendResponse } from '../schemas/friend.schema'
import { OthersProfileDialog } from '@/features/user'

interface FriendListProps {
  searchQuery?: string
}

function getDisplayLetter(name: string): string {
  const firstChar = name.charAt(0).toUpperCase()
  if (/[A-Z]/.test(firstChar)) return firstChar
  const normalized = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  if (/[A-Z]/.test(normalized)) return normalized
  return '#'
}

function isRecentFriend(friendsSince: string): boolean {
  const friendDate = new Date(friendsSince)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - friendDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

export function FriendList({ searchQuery = '' }: FriendListProps) {
  const { text } = useFriendText()
  const { data: friends, isLoading } = useMyFriends()
  const unfriendMutation = useUnfriend()

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const processedFriends = useMemo(() => {
    if (!friends) return { newFriends: [], groupedFriends: {} }

    let filtered = [...friends]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((f) => {
        const userName = f.userName?.toLowerCase() || ''
        const phone = f.phone?.toLowerCase() || ''
        const email = f.email?.toLowerCase() || ''
        return userName.includes(query) || phone.includes(query) || email.includes(query)
      })
    }

    const newFriends = filtered.filter((f) => isRecentFriend(f.friendsSince))
    const otherFriends = filtered.filter((f) => !isRecentFriend(f.friendsSince))

    // Sort by name ascending by default
    const sortFn = (a: FriendResponse, b: FriendResponse) => {
      return a.userName.localeCompare(b.userName, 'vi')
    }

    newFriends.sort(sortFn)
    otherFriends.sort(sortFn)

    const groupedFriends: Record<string, FriendResponse[]> = {}
    otherFriends.forEach((friend) => {
      const letter = getDisplayLetter(friend.userName)
      if (!groupedFriends[letter]) {
        groupedFriends[letter] = []
      }
      groupedFriends[letter].push(friend)
    })

    return { newFriends, groupedFriends }
  }, [friends, searchQuery])

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
    <>
      <div className='flex-1 flex flex-col h-full overflow-hidden bg-background dark:bg-background'>
        {/* Header with Title */}
        <div className='px-4 py-3 border-b border-border shrink-0'>
          <h1 className='text-base font-semibold text-foreground'>
            {text.header.friendCount(totalCount)}
          </h1>
        </div>

        {/* Friends List */}
        <div className='flex-1 overflow-y-auto custom-scrollbar'>
          {isLoading ? (
            <div className='p-4 space-y-3'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 px-4 py-2'>
                  <Skeleton className='w-10 h-10 rounded-full shrink-0' />
                  <Skeleton className='h-4 flex-1' />
                </div>
              ))}
            </div>
          ) : friends && friends.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <SearchEmpty title={text.contactList.noFriendsMessage} />
            </div>
          ) : searchQuery && processedFriends.newFriends.length === 0 && Object.keys(processedFriends.groupedFriends).length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <SearchEmpty title={text.search.noResult} />
            </div>
          ) : (
            <div className='px-4 py-2'>
              {/* New Friends Section */}
              {processedFriends.newFriends.length > 0 && (
                <div className='mb-4'>
                  <div className='text-xs font-semibold text-muted-foreground px-2 py-2'>
                    {text.sections.newFriends}
                  </div>
                  <div className='space-y-0'>
                    {processedFriends.newFriends.map((friend) => (
                      <FriendListItem
                        key={friend.userId}
                        friend={friend}
                        onViewProfile={() => handleViewProfile(friend)}
                        onUnfriend={() => handleUnfriend(friend)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Grouped Friends by Letter */}
              {sortedLetters.map((letter) => (
                <div key={letter} className='mb-2'>
                  <div className='text-sm font-bold text-foreground px-2 py-2'>
                    {letter}
                  </div>
                  <div className='space-y-0'>
                    {processedFriends.groupedFriends[letter].map((friend) => (
                      <FriendListItem
                        key={friend.userId}
                        friend={friend}
                        onViewProfile={() => handleViewProfile(friend)}
                        onUnfriend={() => handleUnfriend(friend)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Dialog */}
      <OthersProfileDialog
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        userId={selectedUserId || undefined}
      />
    </>
  )
}
