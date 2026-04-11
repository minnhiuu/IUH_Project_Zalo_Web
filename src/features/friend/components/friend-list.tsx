import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { FriendListItem } from './friend-list-item'
import { useFriendText } from '../i18n/use-friend-text'
import { useMyFriends, useUnfriend } from '../queries'
import { SearchEmpty } from '@/components/common/search-empty'
import type { FriendResponse } from '../schemas/friend.schema'
import { OthersProfileDialog } from '@/features/user'
import { UnfriendConfirmDialog } from './unfriend-confirm-dialog'

interface FriendListProps {
  searchQuery?: string
}

function getDisplayLetter(name: string): string {
  const firstChar = name.charAt(0).toUpperCase()
  if (/[A-Z]/.test(firstChar)) return firstChar
  const normalized = firstChar
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
  if (/[A-Z]/.test(normalized)) return normalized
  return '#'
}

export function FriendList({ searchQuery = '' }: FriendListProps) {
  const { text } = useFriendText()
  const { data: friends, isLoading } = useMyFriends()
  const unfriendMutation = useUnfriend()
  const safeFriends = useMemo(() => (Array.isArray(friends) ? friends : []), [friends])

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [confirmUnfriendTarget, setConfirmUnfriendTarget] = useState<FriendResponse | null>(null)

  const processedFriends = useMemo(() => {
    if (safeFriends.length === 0) return { groupedFriends: {} }

    let filtered = [...safeFriends]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((f) => {
        const userName = f.userName?.toLowerCase() || ''
        const phone = f.userPhone?.toLowerCase() || ''
        return userName.includes(query) || phone.includes(query)
      })
    }

    // Sort by name ascending by default
    const sortFn = (a: FriendResponse, b: FriendResponse) => {
      return a.userName.localeCompare(b.userName, 'vi')
    }

    filtered.sort(sortFn)

    const groupedFriends: Record<string, FriendResponse[]> = {}
    filtered.forEach((friend) => {
      const letter = getDisplayLetter(friend.userName)
      if (!groupedFriends[letter]) {
        groupedFriends[letter] = []
      }
      groupedFriends[letter].push(friend)
    })

    return { groupedFriends }
  }, [safeFriends, searchQuery])

  const totalCount = safeFriends.length
  const sortedLetters = Object.keys(processedFriends.groupedFriends).sort((a, b) =>
    a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'vi')
  )

  const handleUnfriend = (friend: FriendResponse) => {
    setConfirmUnfriendTarget(friend)
  }

  const handleConfirmUnfriend = () => {
    if (!confirmUnfriendTarget) return

    unfriendMutation.mutate(confirmUnfriendTarget.userId, {
      onSuccess: () => {
        setConfirmUnfriendTarget(null)
      }
    })
  }

  const handleViewProfile = (friend: FriendResponse) => {
    setSelectedUserId(friend.userId)
  }

  const handleMessage = (friend: FriendResponse) => {
    window.location.href = `/chat/u/${friend.userId}`
  }

  return (
    <>
      <div className='flex-1 flex flex-col h-full overflow-hidden bg-background dark:bg-background'>
        {/* Header with Title */}
        <div className='px-4 py-3 border-b border-border shrink-0'>
          <h1 className='text-base font-semibold text-foreground'>{text.header.friendCount(totalCount)}</h1>
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
          ) : safeFriends.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <SearchEmpty title={text.contactList.noFriendsMessage} />
            </div>
          ) : searchQuery &&
            Object.keys(processedFriends.groupedFriends).length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <SearchEmpty title={text.search.noResult} />
            </div>
          ) : (
            <div className='px-4 py-2'>
              {/* Grouped Friends by Letter */}
              {sortedLetters.map((letter) => (
                <div key={letter} className='mb-2'>
                  <div className='text-sm font-bold text-foreground px-2 py-2'>{letter}</div>
                  <div className='space-y-0'>
                    {processedFriends.groupedFriends[letter].map((friend) => (
                      <FriendListItem
                        key={friend.userId}
                        friend={friend}
                        onMessage={() => handleMessage(friend)}
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

      <UnfriendConfirmDialog
        open={!!confirmUnfriendTarget}
        onOpenChange={(open) => !open && setConfirmUnfriendTarget(null)}
        userName={confirmUnfriendTarget?.userName || ''}
        onConfirm={handleConfirmUnfriend}
        isPending={unfriendMutation.isPending}
      />
    </>
  )
}
