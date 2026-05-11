import { Search, X, Loader2, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useSearchText } from '../../shared/hooks/use-search-text'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchUser, useAddSearchItem, useRecordSearchEvent } from '../queries/use-queries'
import { searchKeys } from '../queries/keys'
import { SearchEmpty } from '@/components/common/search-empty'
import { useDebounce } from '@/hooks/use-debounce'
import { OthersProfileDialog, useMyProfile } from '@/features/user'
import { SearchType } from '@/constants/enum'
import { RecentSearchList } from '../../recent/components/recent-search-list'
import { SearchEventType, type UserSearchResponse } from '../schemas/search.schema'
import type { PageResponse } from '@/shared/api'
import {
  FriendStatus,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useFriendText,
  useSendFriendRequest
} from '@/features/friend'
import { type InfiniteData, useQueryClient } from '@tanstack/react-query'

interface SearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchPanel({ open, onOpenChange }: SearchPanelProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined)

  const debouncedKeyword = useDebounce(searchValue, 500)
  const { text } = useSearchText()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetching } =
    useSearchUser(debouncedKeyword)

  const { data: myProfile } = useMyProfile()
  const { mutate: addSearchItem } = useAddSearchItem()
  const { mutate: recordSearchEvent } = useRecordSearchEvent()
  const friendText = useFriendText().text
  const queryClient = useQueryClient()
  const acceptRequestMutation = useAcceptFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()
  const sendRequestMutation = useSendFriendRequest()

  const searchResults = data?.pages.flatMap((page) => page.data) || []

  const isSearching = searchValue !== '' && (isLoading || isFetching || searchValue !== debouncedKeyword)

  const phoneMatchItem = searchResults.find((item) => item.phoneNumber)

  const handleSelectItem = (item: { id: string; fullName: string; avatar?: string }, rank?: number) => {
    const keyword = debouncedKeyword.trim()

    if (keyword) {
      recordSearchEvent({
        keyword,
        targetUserId: item.id,
        rank,
        eventType: SearchEventType.UserResultClick
      })
    }

    addSearchItem({ id: item.id, name: item.fullName, avatar: item.avatar, type: SearchType.User })
    setSelectedUserId(item.id)
  }

  const updateCachedSearchUser = (userId: string, patch: Partial<UserSearchResponse>) => {
    queryClient.setQueryData<InfiniteData<PageResponse<UserSearchResponse>>>(
      searchKeys.search(debouncedKeyword),
      (current) => {
        if (!current) return current

        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            data: page.data.map((user) => (user.id === userId ? { ...user, ...patch } : user))
          }))
        }
      }
    )
  }

  const handleAcceptRequest = (item: UserSearchResponse) => {
    if (!item.friendshipId) return

    acceptRequestMutation.mutate({ requestId: item.friendshipId, requesterId: item.id }, {
      onSuccess: () => {
        updateCachedSearchUser(item.id, {
          friendshipStatus: FriendStatus.Accepted,
          requestedBy: null,
          relationshipLabel: friendText.status.accepted
        })
      }
    })
  }

  const handleCancelRequest = (item: UserSearchResponse) => {
    if (!item.friendshipId) return

    cancelRequestMutation.mutate(item.friendshipId, {
      onSuccess: () => {
        updateCachedSearchUser(item.id, {
          friendshipId: null,
          friendshipStatus: null,
          requestedBy: null,
          relationshipLabel: null
        })
      }
    })
  }

  const handleSendRequest = (item: UserSearchResponse) => {
    sendRequestMutation.mutate({ receiverId: item.id }, {
      onSuccess: (response) => {
        updateCachedSearchUser(item.id, {
          friendshipId: response.data.data.id,
          friendshipStatus: FriendStatus.Pending,
          requestedBy: myProfile?.id,
          relationshipLabel: friendText.actions.recall
        })
      }
    })
  }

  const renderRelationshipActions = (item: UserSearchResponse) => {
    const sentByMe = item.requestedBy === myProfile?.id
    const isPending = item.friendshipStatus === FriendStatus.Pending
    const isAccepted = item.friendshipStatus === FriendStatus.Accepted
    const isMutating =
      acceptRequestMutation.isPending || cancelRequestMutation.isPending || sendRequestMutation.isPending

    if (isAccepted) {
      return null
    }

    if (isPending && sentByMe) {
      return (
        <Button
          variant='secondary'
          size='sm'
          disabled={isMutating || !item.friendshipId}
          onClick={(event) => {
            event.stopPropagation()
            handleCancelRequest(item)
          }}
          className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
        >
          {friendText.actions.recall}
        </Button>
      )
    }

    if (isPending) {
      return (
        <Button
          variant='secondary-blue'
          size='sm'
          disabled={isMutating || !item.friendshipId}
          onClick={(event) => {
            event.stopPropagation()
            handleAcceptRequest(item)
          }}
          className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
        >
          {friendText.requestCard.accept}
        </Button>
      )
    }

    return (
      <Button
        variant='secondary-blue'
        size='sm'
        disabled={isMutating}
        onClick={(event) => {
          event.stopPropagation()
          handleSendRequest(item)
        }}
        className='h-9 flex-1 font-bold text-[15px] rounded-lg border-none shadow-none transition-all active:scale-95'
      >
        {friendText.actions.addFriend}
      </Button>
    )
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 z-50 w-90 bg-background border-r border-border flex flex-col transition-transform duration-300 ease-in-out shadow-[2px_0_5px_rgba(0,0,0,0.05)]',
          open ? 'translate-x-0' : '-translate-x-[calc(100%+64px)]'
        )}
        style={{ left: '64px' }}
      >
        <div className='flex items-center gap-2 px-4 pt-3 pb-1 shrink-0 bg-background'>
          <div className='relative flex-1 group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary' />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue.trim() !== '') {
                  const trimmedValue = searchValue.trim()
                  const isSelfPhone = myProfile?.phoneNumber === trimmedValue

                  addSearchItem({
                    id: isSelfPhone ? myProfile.id : `k-${Date.now()}`,
                    name: trimmedValue,
                    type: SearchType.Keyword
                  })
                }
              }}
              placeholder={text.placeholder}
              className='h-8 pl-10 pr-8 bg-muted border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 text-sm'
              autoFocus
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-text-secondary/50 hover:text-text-primary transition-all'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>
          <Button
            variant='ghost'
            onClick={() => {
              onOpenChange(false)
              setSearchValue('')
            }}
            className='text-[15px] font-semibold whitespace-nowrap h-9 hover:bg-transparent rounded-lg px-1'
          >
            {text.close}
          </Button>
        </div>

        <div className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 overflow-y-auto px-1'>
            {isSearching ? (
              <div className='space-y-2 px-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-3 px-3 py-2.5'>
                    <Skeleton className='w-12 h-12 rounded-full shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchValue === '' ? (
              <RecentSearchList
                recentTitle={text.recent}
                noRecentText={text.noRecent}
                clearAllText={text.clearAll}
                onSelectKeyword={(keyword) => setSearchValue(keyword)}
                onSelectUser={(item) => handleSelectItem(item)}
              />
            ) : (
              <>
                {phoneMatchItem && (
                  <div className='px-4 py-3'>
                    <h3 className='text-[15px] font-bold text-foreground'>{text.findByPhone}</h3>
                  </div>
                )}
                {searchResults.map((item, rank) => {
                  const mutualFriendsCount = item.mutualFriendsCount ?? 0
                  const sharedGroupsCount = item.sharedGroupsCount ?? 0
                  const showFriendLabel = item.friendshipStatus === FriendStatus.Accepted && item.relationshipLabel
                  const hasRelationshipMetadata = showFriendLabel || mutualFriendsCount > 0 || sharedGroupsCount > 0
                  const relationshipActions = renderRelationshipActions(item)

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item, rank)}
                      className='flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg mx-2 my-0.5 group relative'
                    >
                      <UserAvatar src={item.avatar} name={item.fullName} className='w-12 h-12 shrink-0' />
                      <div className='flex min-w-0 flex-1 items-center gap-2'>
                        <div className='flex min-w-0 flex-1 flex-col gap-1'>
                          <span className='min-w-0 truncate text-base font-medium text-foreground'>
                            {item.fullName}
                          </span>

                          {item.phoneNumber && (
                            <span className='truncate text-sm text-muted-foreground'>
                              {text.phoneNumber} <span className='text-primary'>{item.phoneNumber}</span>
                            </span>
                          )}

                          {hasRelationshipMetadata && (
                            <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground'>
                              {showFriendLabel && <span className='truncate'>{item.relationshipLabel}</span>}
                              {mutualFriendsCount > 0 && (
                                <span className='inline-flex min-w-0 items-center gap-1'>
                                  <Users className='size-3 shrink-0' />
                                  <span className='truncate'>
                                    {text.relationship.mutualFriends(mutualFriendsCount)}
                                  </span>
                                </span>
                              )}
                              {sharedGroupsCount > 0 && (
                                <span className='inline-flex min-w-0 items-center gap-1'>
                                  <Users className='size-3 shrink-0' />
                                  <span className='truncate'>{text.relationship.sharedGroups(sharedGroupsCount)}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {relationshipActions && (
                          <div className='flex shrink-0 items-center justify-end self-center'>
                            {relationshipActions}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {searchResults.length === 0 && !isFetching && (
                  <SearchEmpty title={text.noResult} description={text.noResultDescription} />
                )}

                {hasNextPage && (
                  <div className='p-2 flex justify-center'>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className='w-full rounded-sm'
                    >
                      {isFetchingNextPage ? <Loader2 className='w-4 h-4 animate-spin' /> : text.loadMore}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className='mx-4 mt-2 border-t border-section-divider shrink-0' />
        </div>
        <OthersProfileDialog
          userId={selectedUserId}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(undefined)}
        />
      </div>
    </>
  )
}
