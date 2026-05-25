import { useState } from 'react'
import { Users, Ban, MessageSquareWarning, IdCard, UserMinus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StoryViewerModal } from '@/features/social-feed/components/stories/story-viewer-modal'
import { mapPostToSocialStory } from '@/features/social-feed/queries/options'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { UserAvatar, getInitials, getNameColor } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { type UserResponse } from '@/features/user/schemas/user.schema'
import { useUserText } from '../../../i18n/use-user-text'
import { ProfileInfoBase } from '../shared/profile-info-base'
import { BlockUserModal } from '../block-user-modal'
import { useBlockDetails } from '../../../queries/use-queries'
import { cn } from '@/lib/utils'
import {
  useFriendshipStatus,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useSendFriendRequest,
  useUnfriend
} from '@/features/friend/queries'
import { FriendStatus } from '@/features/friend/schemas/friend.schema'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useFriendText } from '@/features/friend/i18n/use-friend-text'
import { UnfriendConfirmDialog } from '@/features/friend/components/unfriend-confirm-dialog'

interface OthersProfileInfoProps {
  user: UserResponse
}

type FriendAction = 'add' | 'accept' | 'withdraw' | null

interface FriendButtonState {
  label: string
  variant: 'secondary' | 'secondary-blue'
  disabled: boolean
  action: FriendAction | 'unfriend'
}

export function OthersProfileInfo({ user }: OthersProfileInfoProps) {
  const { text: userText } = useUserText()
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isUnfriendConfirmOpen, setIsUnfriendConfirmOpen] = useState(false)
  
  const [isViewingAvatar, setIsViewingAvatar] = useState(false)
  const [isViewingStory, setIsViewingStory] = useState(false)

  const { data: blockDetails } = useBlockDetails(user.id)
  const { text: friendText } = useFriendText()
  const { user: currentUser } = useAuthContext()

  const { data: friendshipStatus, isLoading: isLoadingStatus } = useFriendshipStatus(user.id)
  const sendRequestMutation = useSendFriendRequest()
  const acceptRequestMutation = useAcceptFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()
  const unfriendMutation = useUnfriend()

  const getFriendButtonState = (): FriendButtonState => {
    if (isLoadingStatus) {
      return {
        label: '...',
        variant: 'secondary',
        disabled: true,
        action: null
      }
    }

    if (!friendshipStatus || !friendshipStatus.status) {
      return {
        label: userText.profile.addFriend,
        variant: 'secondary',
        disabled: false,
        action: 'add'
      }
    }

    switch (friendshipStatus.status) {
      case FriendStatus.Accepted:
        return {
          label: `✓ ${friendText.status.accepted}`,
          variant: 'secondary',
          disabled: false,
          action: 'unfriend'
        }
      case FriendStatus.Pending: {
        // Check if current user sent the request
        const sentByMe = friendshipStatus.requestedBy === currentUser?.id
        if (sentByMe) {
          return {
            label: userText.profile.message,
            variant: 'secondary-blue',
            disabled: false,
            action: null // This will handle the click separately
          }
        } else {
          return {
            label: friendText.actions.accept,
            variant: 'secondary-blue',
            disabled: false,
            action: 'accept'
          }
        }
      }
      case FriendStatus.Cancelled:
      case FriendStatus.Declined:
        return {
          label: userText.profile.addFriend,
          variant: 'secondary',
          disabled: false,
          action: 'add'
        }
      default:
        return {
          label: userText.profile.addFriend,
          variant: 'secondary',
          disabled: false,
          action: 'add'
        }
    }
  }

  const handleFriendAction = () => {
    const state = getFriendButtonState()
    switch (state.action) {
      case 'add':
        sendRequestMutation.mutate({ receiverId: user.id })
        break
      case 'accept':
        if (friendshipStatus?.friendshipId) {
          acceptRequestMutation.mutate({ requestId: friendshipStatus.friendshipId })
        }
        break
      case 'withdraw':
        if (friendshipStatus?.friendshipId) {
          cancelRequestMutation.mutate(friendshipStatus.friendshipId)
        }
        break
      case 'unfriend':
        setIsUnfriendConfirmOpen(true)
        break
    }
  }

  const buttonState = getFriendButtonState()
  const canUnfriend = friendshipStatus?.status === FriendStatus.Accepted && currentUser?.id !== user.id

  const handleConfirmUnfriend = () => {
    unfriendMutation.mutate(user.id, {
      onSuccess: () => {
        setIsUnfriendConfirmOpen(false)
      }
    })
  }

  if (user.active === false) {
    return null
  }

  return (
    <ProfileInfoBase
      user={user}
      cover={
        <div className='w-full h-full bg-muted overflow-hidden relative'>
          {user.background ? (
            <img
              src={user.background}
              alt='cover'
              className='h-full w-full object-cover'
              style={{
                objectPosition: `center ${user.backgroundY || 50}%`
              }}
            />
          ) : (
            <div className='h-full w-full bg-linear-to-r from-brand-blue-dark to-brand-blue opacity-90' />
          )}
        </div>
      }
      avatar={
        <DropdownMenu>
          <DropdownMenuTrigger className='rounded-full outline-none focus:outline-none'>
            <div 
              className={cn(
                'rounded-full transition-all hover:opacity-90 flex items-center justify-center',
                user.story?.hasUnviewed 
                  ? 'bg-brand-blue p-[2px]' 
                  : (user.story && user.story.stories?.length > 0) 
                    ? 'bg-zinc-300 dark:bg-zinc-700 p-[2px]' 
                    : 'bg-transparent p-0'
              )}
            >
              <div className='rounded-full border-4 border-background bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] w-20 h-20 overflow-hidden'>
                <UserAvatar
                  src={user.avatar}
                  name={user.fullName}
                  className='w-full h-full'
                  fallbackClassName='text-2xl font-bold'
                />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-48'>
            <DropdownMenuItem onClick={() => setIsViewingAvatar(true)} className='cursor-pointer'>
              Xem ảnh đại diện
            </DropdownMenuItem>
            {user.story && user.story.stories?.length > 0 && (
              <DropdownMenuItem onClick={() => setIsViewingStory(true)} className='cursor-pointer'>
                Xem story
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      }
      contentBeforeInfo={
        <div className='w-full mb-4 mt-2'>
          <div className='flex gap-3 w-full'>
            <Button
              variant={buttonState.variant}
              disabled={
                buttonState.disabled ||
                sendRequestMutation.isPending ||
                acceptRequestMutation.isPending ||
                cancelRequestMutation.isPending
              }
              onClick={handleFriendAction}
              className='flex-1 font-bold h-9 rounded-md border-none shadow-none transition-all active:scale-95 group relative overflow-hidden'
            >
              <span className={cn('transition-opacity duration-200', buttonState.action === 'unfriend' && 'group-hover:opacity-0')}>
                {buttonState.label}
              </span>
              {buttonState.action === 'unfriend' && (
                <span className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-destructive'>
                  {friendText.actions.unfriend}
                </span>
              )}
            </Button>
            <Button
              variant='secondary-blue'
              className='flex-1 font-bold h-9 rounded-md border-none shadow-none transition-all active:scale-95'
              onClick={() => {
                if (
                  friendshipStatus?.status === FriendStatus.Accepted ||
                  (friendshipStatus?.friendshipId && friendshipStatus?.status)
                ) {
                  // It doesn't mean they have a chat, but maybe they do. We just route to /chat/u/ user.id
                  // ChatLayout will fallback to cached chat if it exists.
                }
                window.location.href = `/chat/u/${user.id}`
                // Using window.location to ensure ChatLayout remounts or just navigate
              }}
            >
              {userText.profile.message}
            </Button>
          </div>
        </div>
      }
      footer={
        <>
          <Separator className='h-1.5 bg-section-divider border-none shrink-0' />
          <div className='flex flex-col py-2 bg-background'>
            {[
              { icon: Users, label: userText.profile.mutualGroups(0), color: 'text-disabled', disabled: true },
              { icon: IdCard, label: userText.profile.shareContact, color: 'text-disabled', disabled: true },
              {
                icon: Ban,
                label: blockDetails ? userText.profile.editBlock : userText.profile.block,
                color: 'text-icon-secondary',
                disabled: false,
                onClick: () => setIsBlockModalOpen(true)
              },
              {
                icon: MessageSquareWarning,
                label: userText.profile.report,
                color: 'text-icon-secondary',
                disabled: false
              },
              ...(canUnfriend
                ? [
                    {
                      icon: UserMinus,
                      label: friendText.actions.unfriend,
                      color: 'text-destructive',
                      disabled: false,
                      onClick: () => setIsUnfriendConfirmOpen(true)
                    }
                  ]
                : [])
            ].map((item, idx, arr) => (
              <div key={item.label}>
                {item.disabled ? (
                  <div className='flex w-full items-center gap-3 px-4 py-3.5 text-[15px]'>
                    <item.icon className={cn('h-5 w-5', item.color)} strokeWidth={1.5} />
                    <span className={cn('font-medium', item.color)}>{item.label}</span>
                  </div>
                ) : (
                  <button
                    className='flex w-full items-center gap-3 px-4 py-3.5 text-[15px] hover:bg-muted transition-colors text-foreground group cursor-pointer'
                    onClick={item.onClick}
                  >
                    <item.icon
                      className={cn('h-5 w-5 group-hover:opacity-80 transition-opacity', item.color)}
                      strokeWidth={1.5}
                    />
                    <span className='font-medium'>{item.label}</span>
                  </button>
                )}
                {idx < arr.length - 1 && <Separator className='ml-12 mr-4 bg-border/40' />}
              </div>
            ))}
          </div>

          <BlockUserModal
            open={isBlockModalOpen}
            onOpenChange={setIsBlockModalOpen}
            userId={user.id}
            userName={user.fullName}
            isBlocked={!!blockDetails}
            currentPreference={blockDetails?.preference}
          />

          <UnfriendConfirmDialog
            open={isUnfriendConfirmOpen}
            onOpenChange={setIsUnfriendConfirmOpen}
            userName={user.fullName}
            onConfirm={handleConfirmUnfriend}
            isPending={unfriendMutation.isPending}
          />
          
          {/* Avatar Viewer Modal */}
          <Dialog open={isViewingAvatar} onOpenChange={setIsViewingAvatar}>
            <DialogContent className='max-w-[90vw] md:max-w-4xl max-h-[90vh] bg-transparent border-none shadow-none flex items-center justify-center' showCloseButton={false}>
              <DialogTitle className='sr-only'>Ảnh đại diện</DialogTitle>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt='Avatar'
                  className='max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl'
                />
              ) : (
                <div 
                  className='w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] rounded-full flex items-center justify-center text-white text-[100px] md:text-[150px] font-bold shadow-2xl'
                  style={{ backgroundColor: getNameColor(user?.fullName || 'User') }}
                >
                  {getInitials(user?.fullName || 'User')}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Story Viewer Modal */}
          {isViewingStory && user.story && user.story.stories.length > 0 && (
            <StoryViewerModal
              open={isViewingStory}
              onOpenChange={setIsViewingStory}
              initialGroupIndex={0}
              groups={[
                {
                  authorId: user.id || '',
                  authorName: user.fullName || 'User',
                  authorAvatar: user.avatar,
                  stories: user.story.stories.map(mapPostToSocialStory)
                }
              ]}
            />
          )}
        </>
      }
    />
  )
}
