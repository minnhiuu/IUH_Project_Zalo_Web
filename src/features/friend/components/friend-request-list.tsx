import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, UserRoundPlus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { FriendRequestCard } from './friend-request-card'
import { FriendSuggestionCard } from './friend-suggestion-card'
import { useFriendText } from '../i18n/use-friend-text'
import {
  useReceivedFriendRequests,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useSendFriendRequest,
  useUnifiedSuggestionsInfinite
} from '../queries'
import { SearchEmpty } from '@/components/common/search-empty'
import type { FriendRequestResponse } from '../schemas/friend.schema'
import { OthersProfileDialog } from '@/features/user'
import { AddFriendConfirmDialog } from './add-friend-confirm-dialog'
import type { UserSummaryResponse } from '@/shared/user/user-summary'
import { ContactPageLayout } from './contact-page-layout'

export function FriendRequestList() {
  const { text } = useFriendText()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(new Set())
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(true)
  const [confirmUser, setConfirmUser] = useState<UserSummaryResponse | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

  const suggestionPageSize = 15

  const { data: receivedRequests, isLoading: isLoadingReceived } = useReceivedFriendRequests(0, 12)
  const {
    data: suggestionPages,
    isLoading: isLoadingSuggestions,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useUnifiedSuggestionsInfinite(suggestionPageSize, isSuggestionsExpanded)

  const acceptMutation = useAcceptFriendRequest()
  const declineMutation = useDeclineFriendRequest()
  const sendRequestMutation = useSendFriendRequest()

  const handleAccept = (friendshipId: string) => {
    acceptMutation.mutate({ requestId: friendshipId })
  }

  const handleDecline = (friendshipId: string) => {
    declineMutation.mutate({ requestId: friendshipId })
  }

  const handleAddFriend = (user: UserSummaryResponse) => {
    setConfirmUser(user)
    setShowConfirmDialog(true)
  }

  const handleSkipSuggestion = (suggestionId: string) => {
    setHiddenSuggestions((prev) => new Set([...prev, suggestionId]))
  }

  const mergedSuggestions = useMemo(
    () => suggestionPages?.pages.flatMap((page) => page.data || []) || [],
    [suggestionPages]
  )

  const visibleSuggestions = useMemo(
    () => mergedSuggestions.filter((s) => !hiddenSuggestions.has(s.userId)),
    [mergedSuggestions, hiddenSuggestions]
  )

  useEffect(() => {
    if (!isSuggestionsExpanded) return
    if (!hasNextPage) return

    const triggerNode = loadMoreTriggerRef.current
    if (!triggerNode) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: '200px 0px',
        threshold: 0.1
      }
    )

    observer.observe(triggerNode)

    return () => observer.disconnect()
  }, [isSuggestionsExpanded, hasNextPage, isFetchingNextPage, fetchNextPage])

  const toggleSuggestionPanel = () => {
    setIsSuggestionsExpanded((prev) => !prev)
  }

  const renderReceivedRequestsSkeleton = () => (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className='p-4 border border-border rounded-xl bg-background space-y-3'>
          <div className='flex items-start gap-3'>
            <Skeleton className='w-12 h-12 rounded-full shrink-0' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          </div>
          <Skeleton className='h-16 w-full rounded-lg' />
          <div className='flex gap-2'>
            <Skeleton className='h-9 flex-1' />
            <Skeleton className='h-9 flex-1' />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <ContactPageLayout
      title={text.sidebar.friendRequests}
      icon={UserRoundPlus}
    >
      <div className='flex-1 overflow-y-auto bg-background'>
        <div className='p-6 space-y-6'>
          {/* Received Friend Requests Section */}
          <section>
            <h2 className='text-[15px] font-semibold text-text-primary mb-4'>
              {text.sections.receivedRequests(receivedRequests?.length ?? 0)}
            </h2>

            {isLoadingReceived ? (
              renderReceivedRequestsSkeleton()
            ) : receivedRequests && receivedRequests.length > 0 ? (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {receivedRequests.map((request: FriendRequestResponse) => (
                  <FriendRequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => handleAccept(request.id)}
                    onDecline={() => handleDecline(request.id)}
                    onViewProfile={() => setSelectedUserId(request.requestedUserId)}
                    isAccepting={acceptMutation.isPending}
                    isDeclining={declineMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className='bg-background rounded-xl border border-border p-8'>
                <SearchEmpty title={text.empty.received} />
              </div>
            )}
          </section>

          {/* Friend Suggestions Section */}
          <section>
            <div className='flex items-center justify-between gap-3 mb-4'>
              <button
                type='button'
                onClick={toggleSuggestionPanel}
                className='inline-flex items-center gap-2 hover:opacity-80 transition-opacity'
              >
                <h2 className='text-[15px] font-semibold text-text-primary'>
                  {text.sections.suggestions(visibleSuggestions.length)}
                </h2>
                <ChevronDown
                  className={`w-4 h-4 text-text-secondary transition-transform ${isSuggestionsExpanded ? '' : '-rotate-90'}`}
                />
              </button>
            </div>

            {!isSuggestionsExpanded ? null : isLoadingSuggestions ? (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='bg-background rounded-xl border border-border p-4 space-y-4'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='w-12 h-12 rounded-full' />
                      <div className='space-y-2 flex-1'>
                        <Skeleton className='h-4 w-2/3' />
                        <Skeleton className='h-3 w-1/2' />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <Skeleton className='h-9' />
                      <Skeleton className='h-9' />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleSuggestions.length > 0 ? (
              <div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {visibleSuggestions.map((suggestion) => (
                    <FriendSuggestionCard
                      key={suggestion.userId}
                      suggestion={suggestion}
                      onAddFriend={() =>
                        handleAddFriend({
                          id: suggestion.userId,
                          fullName: suggestion.fullName,
                          avatar: suggestion.avatar,
                          phoneNumber: suggestion.phoneNumber || undefined
                        })
                      }
                      onSkip={() => handleSkipSuggestion(suggestion.userId)}
                      onViewProfile={() => setSelectedUserId(suggestion.userId)}
                      isAdding={sendRequestMutation.isPending}
                    />
                  ))}
                </div>

                {(isFetchingNextPage || hasNextPage) && (
                  <div ref={loadMoreTriggerRef} className='mt-4'>
                    {isFetchingNextPage && (
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className='bg-background rounded-xl border border-border p-4 space-y-4'>
                            <div className='flex items-center gap-3'>
                              <Skeleton className='w-14 h-14 rounded-full' />
                              <div className='space-y-2 flex-1'>
                                <Skeleton className='h-4 w-2/3' />
                                <Skeleton className='h-3 w-1/2' />
                              </div>
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                              <Skeleton className='h-9' />
                              <Skeleton className='h-9' />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-background rounded-xl border border-border p-8'>
                <SearchEmpty title={text.empty.suggestions} />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Profile Dialog */}
      <OthersProfileDialog
        userId={selectedUserId ?? undefined}
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />

      {confirmUser && (
        <AddFriendConfirmDialog
          open={showConfirmDialog}
          onOpenChange={(open) => {
            setShowConfirmDialog(open)
            if (!open) setConfirmUser(null)
          }}
          user={confirmUser}
        />
      )}
    </ContactPageLayout>
  )
}
