import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { FriendListItem } from './friend-list-item'
import { useFriendText } from '../i18n/use-friend-text'
import { useMyFriends, useUnfriend } from '../queries'
import { SearchEmpty } from '@/components/common/search-empty'
import type { FriendResponse } from '../schemas/friend.schema'
import { OthersProfileDialog } from '@/features/user'
import { UnfriendConfirmDialog } from './unfriend-confirm-dialog'
import { Users } from 'lucide-react'
import { ContactsFilter } from './contacts-filter'
import type { FilterType, SortType } from './contacts-filter'
import { ContactPageLayout } from './contact-page-layout'

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

export function FriendList({ searchQuery: initialSearchQuery = '' }: FriendListProps) {
  const { text } = useFriendText()
  const navigate = useNavigate()
  const { data: friends, isLoading } = useMyFriends()
  const unfriendMutation = useUnfriend()
  const safeFriends = useMemo(() => (Array.isArray(friends) ? friends : []), [friends])

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [confirmUnfriendTarget, setConfirmUnfriendTarget] = useState<FriendResponse | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('name_asc')

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

    // Apply filtering (if any specific categories exist, for now just 'all')
    if (filterType !== 'all') {
      // Add logic for other filters if needed (e.g., online status)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const nameA = a.userName || ''
      const nameB = b.userName || ''
      if (sortType === 'name_desc') {
        return nameB.localeCompare(nameA, 'vi')
      }
      return nameA.localeCompare(nameB, 'vi')
    })

    const groupedFriends: Record<string, FriendResponse[]> = {}
    filtered.forEach((friend) => {
      const letter = getDisplayLetter(friend.userName)
      if (!groupedFriends[letter]) {
        groupedFriends[letter] = []
      }
      groupedFriends[letter].push(friend)
    })

    return { groupedFriends }
  }, [safeFriends, searchQuery, sortType, filterType])

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
    navigate(`/chat/u/${friend.userId}`)
  }

  return (
    <>
    <ContactPageLayout
      title={text.contactList.title}
      icon={Users}
      categoryTitle={text.header.friendCount(totalCount)}
    >
      <div className='flex flex-col bg-background rounded-xl border border-divider-bold overflow-hidden mb-4 shrink-0'>
        {/* Filter is now inside the same container as the list */}
        <div className='bg-background border-b border-divider'>
          <ContactsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterChange={setFilterType}
            sortType={sortType}
            onSortChange={setSortType}
            totalCount={safeFriends.length}
          />
        </div>
        
        <div className='flex flex-col'>
            {isLoading ? (
              <div className='p-4 space-y-3'>
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-3 px-4 py-2 border-b border-muted/20'>
                    <Skeleton className='w-10 h-10 rounded-full shrink-0' />
                    <Skeleton className='h-4 flex-1 max-w-[200px]' />
                  </div>
                ))}
              </div>
            ) : safeFriends.length === 0 ? (
              <div className='flex items-center justify-center h-full'>
                <SearchEmpty title={text.contactList.noFriendsMessage} />
              </div>
            ) : searchQuery && sortedLetters.length === 0 ? (
              <div className='flex items-center justify-center h-full'>
                <SearchEmpty title={text.search.noResult} />
              </div>
            ) : (
              <div className='px-4 py-2'>
                {/* Grouped Friends by Letter */}
                {sortedLetters.map((letter) => (
                  <div key={letter} className='mb-2'>
                    <div className='text-sm font-bold text-text-primary px-2 py-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10'>
                      {letter}
                    </div>
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
      </ContactPageLayout>

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
