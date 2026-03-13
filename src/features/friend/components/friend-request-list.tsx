import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { FriendRequestCard } from './friend-request-card'
import { FriendSuggestionCard, type FriendSuggestion } from './friend-suggestion-card'
import { useFriendText } from '../i18n/use-friend-text'
import {
  useReceivedFriendRequests,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useSendFriendRequest
} from '../queries'
import { SearchEmpty } from '@/components/common/search-empty'
import type { FriendRequestResponse } from '../schemas/friend.schema'
import { OthersProfileDialog } from '@/features/user'

// Mock friend suggestions - in real app this would come from API
const MOCK_SUGGESTIONS: FriendSuggestion[] = [
  { id: '1', userId: 'u1', userName: 'Đào Phúc Khang', userAvatar: '', mutualGroupsCount: 15 },
  { id: '2', userId: 'u2', userName: 'Trương Duy Thanh Nhàn', userAvatar: '', mutualGroupsCount: 13 },
  { id: '3', userId: 'u3', userName: 'Châu Ngân', userAvatar: '', mutualGroupsCount: 11 },
  { id: '4', userId: 'u4', userName: 'Duy Phú', userAvatar: '', mutualGroupsCount: 10 },
  { id: '5', userId: 'u5', userName: 'Dương Nhật Anh', userAvatar: '', mutualGroupsCount: 8 },
  { id: '6', userId: 'u6', userName: 'Lê Thị Hiền', userAvatar: '', mutualGroupsCount: 8 }
]

export function FriendRequestList() {
  const { text } = useFriendText()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(new Set())

  const { data: receivedRequests, isLoading: isLoadingReceived } = useReceivedFriendRequests()

  const acceptMutation = useAcceptFriendRequest()
  const declineMutation = useDeclineFriendRequest()
  const sendRequestMutation = useSendFriendRequest()

  const handleAccept = (friendshipId: string) => {
    acceptMutation.mutate(friendshipId)
  }

  const handleDecline = (friendshipId: string) => {
    declineMutation.mutate(friendshipId)
  }

  const handleAddFriend = (userId: string) => {
    sendRequestMutation.mutate({ receiverId: userId })
  }

  const handleSkipSuggestion = (suggestionId: string) => {
    setHiddenSuggestions((prev) => new Set([...prev, suggestionId]))
  }

  const visibleSuggestions = MOCK_SUGGESTIONS.filter((s) => !hiddenSuggestions.has(s.id))

  const renderReceivedRequestsSkeleton = () => (
    <div className='flex gap-4 overflow-x-auto pb-2'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='min-w-70 max-w-80 p-4 border rounded-lg space-y-3'>
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
    <div className='flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5] dark:bg-background'>
      {/* Header */}
      <div className='bg-background border-b border-border px-6 py-3 shrink-0'>
        <h1 className='text-[17px] font-semibold text-foreground'>{text.sidebar.friendRequests}</h1>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='p-6 space-y-6'>
          {/* Received Friend Requests Section */}
          <section>
            <h2 className='text-[15px] font-semibold text-foreground mb-4'>
              {text.sections.receivedRequests(receivedRequests?.length ?? 0)}
            </h2>

            {isLoadingReceived ? (
              renderReceivedRequestsSkeleton()
            ) : receivedRequests && receivedRequests.length > 0 ? (
              <div className='flex gap-4 overflow-x-auto pb-2 -mx-2 px-2'>
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
              <div className='bg-background rounded-lg border border-border p-8'>
                <SearchEmpty title={text.empty.received} />
              </div>
            )}
          </section>

          {/* Friend Suggestions Section */}
          <section>
            <div className='flex items-center gap-2 mb-4'>
              <h2 className='text-[15px] font-semibold text-foreground'>
                {text.sections.suggestions(visibleSuggestions.length)}
              </h2>
              <ChevronDown className='w-4 h-4 text-muted-foreground' />
            </div>

            {visibleSuggestions.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {visibleSuggestions.map((suggestion) => (
                  <FriendSuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAddFriend={() => handleAddFriend(suggestion.userId)}
                    onSkip={() => handleSkipSuggestion(suggestion.id)}
                    onViewProfile={() => setSelectedUserId(suggestion.userId)}
                    isAdding={sendRequestMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className='bg-background rounded-lg border border-border p-8'>
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
    </div>
  )
}
