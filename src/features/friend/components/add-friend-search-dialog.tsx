import { useState } from 'react'
import { X, Phone, Search as SearchIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/common/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchUser } from '@/features/search-user/queries/use-queries'
import { useDebounce } from '@/hooks/use-debounce'
import { useFriendshipStatus, useAcceptFriendRequest, useCancelFriendRequest } from '../queries'
import { FriendStatus } from '../schemas/friend.schema'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useFriendText } from '../i18n/use-friend-text'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { UserSummaryResponse } from '@/shared/user/user-summary'
import { AddFriendConfirmDialog } from './add-friend-confirm-dialog'

interface AddFriendSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResultItemProps {
  user: UserSummaryResponse
  onAddFriend: () => void
}

function SearchResultItem({ user, onAddFriend }: SearchResultItemProps) {
  const { data: friendshipStatus, isLoading: isLoadingStatus } = useFriendshipStatus(user.id)
  const { user: currentUser } = useAuthContext()
  const { text } = useFriendText()
  const acceptRequestMutation = useAcceptFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()

  const getButtonState = () => {
    if (isLoadingStatus) {
      return { disabled: true, label: '...', variant: 'outline' as const, action: null as any }
    }

    if (!friendshipStatus || !friendshipStatus.status) {
      return { disabled: false, label: text.actions.addFriend, variant: 'default' as const, action: 'add' }
    }

    switch (friendshipStatus.status) {
      case FriendStatus.Accepted:
        return { disabled: true, label: `${text.status.accepted}`, variant: 'secondary' as const, action: null }
      case FriendStatus.Pending:
        // Check if current user sent the request
        const sentByMe = friendshipStatus.requestedBy === currentUser?.id
        if (sentByMe) {
          return { disabled: false, label: text.actions.recall, variant: 'outline' as const, action: 'recall' }
        } else {
          return { disabled: false, label: text.actions.accept, variant: 'default' as const, action: 'accept' }
        }
      case FriendStatus.Cancelled:
      case FriendStatus.Declined:
        return { disabled: false, label: text.actions.addFriend, variant: 'default' as const, action: 'add' }
      default:
        return { disabled: false, label: text.actions.addFriend, variant: 'default' as const, action: 'add' }
    }
  }

  const handleClick = () => {
    const state = getButtonState()
    switch (state.action) {
      case 'add':
        onAddFriend()
        break
      case 'accept':
        if (friendshipStatus?.friendshipId) {
          acceptRequestMutation.mutate(friendshipStatus.friendshipId, {
            onSuccess: () => {
              showSuccessToast(text.toast.acceptSuccess)
            },
            onError: () => {
              showErrorToast(text.toast.acceptError)
            }
          })
        }
        break
      case 'recall':
        if (friendshipStatus?.friendshipId) {
          cancelRequestMutation.mutate(friendshipStatus.friendshipId, {
            onSuccess: () => {
              showSuccessToast(text.toast.cancelSuccess)
            },
            onError: () => {
              showErrorToast(text.toast.cancelError)
            }
          })
        }
        break
    }
  }

  const buttonState = getButtonState()

  return (
    <div className='flex items-center gap-3 py-3 px-0 hover:bg-muted/50 rounded-lg transition-colors'>
      <UserAvatar src={user.avatar} name={user.fullName} className='w-11 h-11 shrink-0' />
      <div className='flex-1 min-w-0'>
        <h4 className='text-sm font-semibold text-foreground truncate'>{user.fullName}</h4>
        <p className='text-xs text-muted-foreground mt-0.5'>{text.dialogs.addFriendSearch.friendSuggestion}</p>
      </div>
      <Button
        onClick={handleClick}
        disabled={buttonState.disabled || acceptRequestMutation.isPending || cancelRequestMutation.isPending}
        className={`h-7 px-3 text-xs font-medium shrink-0 whitespace-nowrap ${
          buttonState.variant === 'default'
            ? 'bg-primary hover:bg-primary/90 text-white'
            : buttonState.variant === 'outline'
            ? 'border border-border bg-background hover:bg-muted text-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {buttonState.label}
      </Button>
    </div>
  )
}

export function AddFriendSearchDialog({ open, onOpenChange }: AddFriendSearchDialogProps) {
  const { text } = useFriendText()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserSummaryResponse | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const debouncedQuery = useDebounce(searchQuery, 500)
  const searchKeyword = debouncedQuery.trim().length >= 2 ? debouncedQuery : ''

  const { data, isLoading, isFetching } = useSearchUser(searchKeyword)
  const searchResults = data?.pages.flatMap((page) => page.data) || []

  const isSearching = searchQuery.trim() !== '' && (isLoading || isFetching || searchQuery !== debouncedQuery)

  const handleAddFriend = (user: UserSummaryResponse) => {
    setSelectedUser(user)
    setShowConfirmDialog(true)
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchQuery('')
    setSelectedUser(null)
  }

  const handleSearch = () => {
    // Search is automatic via useSearchUser hook
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='w-full max-w-sm p-0 gap-0 sm:rounded-lg border shadow-lg' showCloseButton>
          {/* Header */}
          <DialogHeader className='px-5 pt-4 pb-3 border-b border-border bg-background'>
            <DialogTitle className='text-base font-semibold text-foreground'>{text.addFriend.title}</DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className='flex flex-col'>
            {/* Search Input Section */}
            <div className='px-5 py-4 border-b border-border/60 bg-background'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center px-2.5 py-1.5 bg-muted rounded-md text-xs font-medium text-muted-foreground'>
                  {text.dialogs.addFriendSearch.countryCode}
                </div>
                <div className='flex-1 relative'>
                  <Input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={text.addFriend.phonePlaceholder}
                    className='h-9 pl-3 pr-8 border border-border/60 bg-white dark:bg-slate-950 hover:bg-muted/30 focus-visible:bg-background transition-colors rounded-md text-sm'
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search Results Section */}
            <div className='px-5 py-4 max-h-72 overflow-y-auto flex-1 bg-background'>
              {searchKeyword && (
                <p className='text-xs font-semibold text-foreground mb-3 flex items-center gap-2'>
                  <SearchIcon className='w-3.5 h-3.5 text-muted-foreground' />
                  {text.dialogs.addFriendSearch.recentResults}
                </p>
              )}

              {isSearching ? (
                <div className='space-y-3'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='flex items-center gap-3'>
                      <Skeleton className='w-10 h-10 rounded-full shrink-0' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-3.5 w-2/3' />
                        <Skeleton className='h-3 w-1/2' />
                      </div>
                      <Skeleton className='h-7 w-16' />
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className='space-y-1'>
                  {searchResults.map((user) => (
                    <SearchResultItem
                      key={user.id}
                      user={user}
                      onAddFriend={() => handleAddFriend(user)}
                    />
                  ))}
                </div>
              ) : searchKeyword ? (
                <div className='py-8 text-center'>
                  <Phone className='w-8 h-8 text-muted-foreground/30 mx-auto mb-2' />
                  <p className='text-xs text-muted-foreground'>{text.dialogs.addFriendSearch.noUsersFound}</p>
                </div>
              ) : (
                <div className='py-6 text-center'>
                  <Phone className='w-8 h-8 text-muted-foreground/30 mx-auto mb-2' />
                  <p className='text-xs text-muted-foreground'>{text.dialogs.addFriendSearch.emptyState}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className='px-5 py-3 border-t border-border/60 flex items-center justify-end gap-2 bg-background'>
            <Button
              variant='outline'
              onClick={handleClose}
              className='px-5 h-8 text-sm font-medium'
            >
              {text.dialogs.addFriendSearch.cancel}
            </Button>
            <Button
              onClick={handleSearch}
              disabled={searchQuery.trim().length < 2}
              className='px-5 h-8 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white'
            >
              {text.dialogs.addFriendSearch.search}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      {selectedUser && (
        <AddFriendConfirmDialog
          open={showConfirmDialog}
          onOpenChange={(open) => {
            setShowConfirmDialog(open)
            if (!open) setSelectedUser(null)
          }}
          user={selectedUser}
        />
      )}
    </>
  )
}
