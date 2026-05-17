import { UserAvatar } from '@/components/common/user-avatar'
import { useState } from 'react'
import { useUnifiedSuggestions, useOnlineFriends } from '@/features/friend/queries'
import { useNavigate } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { AddFriendConfirmDialog } from '@/features/friend/components/add-friend-confirm-dialog'
import type {
  FriendResponse,
  FriendSuggestionResponse
} from '@/features/friend/schemas/friend.schema'
import type { UserSummaryResponse } from '@/shared/user/user-summary'
import { useSocialText } from '../../i18n/use-social-text'

export function SuggestedFriendsSidebar() {
  const { text } = useSocialText()
  const navigate = useNavigate()
  const [confirmUser, setConfirmUser] = useState<UserSummaryResponse | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: suggestionsData, isLoading: isSuggestionsLoading } = useUnifiedSuggestions(0, 5)
  const { data: onlineData, isLoading: isFriendsLoading } = useOnlineFriends(0, 10)

  const suggestions = (suggestionsData as FriendSuggestionResponse[]) || []
  const activeFriends = onlineData?.data || []

  const handleAddFriend = (suggestion: FriendSuggestionResponse) => {
    setConfirmUser({
      id: suggestion.userId,
      fullName: suggestion.fullName,
      phoneNumber: suggestion.phoneNumber,
      avatar: suggestion.avatar
    })
    setShowConfirmDialog(true)
  }

  return (
    <div className='w-full'>
      <div className='sticky top-8 space-y-12'>
        {/* 1. Suggested for you (Top) */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between px-2'>
            <h3 className='text-[14px] font-bold text-zinc-500 dark:text-zinc-400'>
              {text.suggested.suggestedForYou}
            </h3>
            <button className='text-[12px] font-bold text-primary hover:text-primary-hover'>
              {text.suggested.seeAllLabel}
            </button>
          </div>
          <div className='space-y-4'>
            {isSuggestionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 px-2'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-3 w-2/3' />
                    <Skeleton className='h-2 w-1/3' />
                  </div>
                </div>
              ))
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div key={suggestion.userId} className='flex items-center justify-between p-2 rounded-xl group hover:bg-white dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-white/5'>
                  <div
                    className='flex items-center gap-3 cursor-pointer'
                    onClick={() => navigate(`/profile/${suggestion.userId}`)}
                  >
                    <UserAvatar src={suggestion.avatar} name={suggestion.fullName} className='h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm' />
                    <div className='flex flex-col'>
                      <span className='text-[14.5px] font-bold text-zinc-900 dark:text-white truncate max-w-[140px] group-hover:text-primary transition-colors'>
                        {suggestion.fullName}
                      </span>
                      <span className='text-[11.5px] font-medium text-zinc-500'>
                        {text.suggested.mutualFriendsCount(suggestion.mutualFriendsCount || 0)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFriend(suggestion)}
                    className='px-3 py-1.5 text-[12px] font-bold text-primary hover:bg-primary/5 rounded-lg transition-all'
                  >
                    {text.suggested.addFriend}
                  </button>
                </div>
              ))
            ) : (
              <div className='px-2 py-4 text-center text-[13px] text-zinc-500 dark:text-zinc-400 bg-white/30 dark:bg-zinc-900/20 rounded-lg border border-dashed border-zinc-200 dark:border-white/5'>
                {text.suggested.noSuggestions}
              </div>
            )}
          </div>
        </div>

        {/* 2. Active Friends (Vertical - Below) */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between px-2'>
            <h3 className='text-[14px] font-bold text-zinc-500 dark:text-zinc-400'>
              {text.suggested.activeFriends}
            </h3>
            <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
          </div>
          <div className='space-y-4 px-2'>
            {isFriendsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-3 w-2/3' />
                    <Skeleton className='h-2 w-1/2' />
                  </div>
                </div>
              ))
            ) : activeFriends.length > 0 ? (
              activeFriends.map((friend) => (
                <div key={friend.id} className='flex items-center gap-3 p-2 rounded-xl cursor-pointer group hover:bg-white dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-white/5'>
                  <div className='relative'>
                    <UserAvatar
                      src={friend.avatar}
                      name={friend.fullName}
                      className='h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm'
                    />
                    <span className='absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-[14.5px] font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors'>
                      {friend.fullName}
                    </span>
                    <span className='text-[11px] font-bold uppercase tracking-wider text-green-500/80'>{text.suggested.online}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className='py-2 text-[13px] text-zinc-500 dark:text-zinc-400'>
                {text.suggested.noActiveFriends}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  )
}
