import { useState } from 'react'
import { Users, Ban, MessageSquareWarning, IdCard } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
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
  useSendFriendRequest
} from '@/features/friend/queries'
import { FriendStatus } from '@/features/friend/schemas/friend.schema'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useFriendText } from '@/features/friend/i18n/use-friend-text'

interface OthersProfileInfoProps {
  user: UserResponse
}

type FriendAction = 'add' | 'accept' | 'withdraw' | null

interface FriendButtonState {
  label: string
  variant: 'secondary' | 'secondary-blue'
  disabled: boolean
  action: FriendAction
}

export function OthersProfileInfo({ user }: OthersProfileInfoProps) {
  const { text: userText } = useUserText()
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)

  const { data: blockDetails } = useBlockDetails(user.id)
  const { text: friendText } = useFriendText()
  const { user: currentUser } = useAuthContext()

  const { data: friendshipStatus, isLoading: isLoadingStatus } = useFriendshipStatus(user.id)
  const sendRequestMutation = useSendFriendRequest()
  const acceptRequestMutation = useAcceptFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()

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
          disabled: true,
          action: null
        }
      case FriendStatus.Pending: {
        // Check if current user sent the request
        const sentByMe = friendshipStatus.requestedBy === currentUser?.id
        if (sentByMe) {
          return {
            label: friendText.actions.withdraw,
            variant: 'secondary',
            disabled: false,
            action: 'withdraw'
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
          acceptRequestMutation.mutate(friendshipStatus.friendshipId)
        }
        break
      case 'withdraw':
        if (friendshipStatus?.friendshipId) {
          cancelRequestMutation.mutate(friendshipStatus.friendshipId)
        }
        break
    }
  }

  const buttonState = getFriendButtonState()

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
        <div className='rounded-full border-4 border-background bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] w-20 h-20 overflow-hidden relative'>
          <UserAvatar
            src={user.avatar}
            name={user.fullName}
            className='w-full h-full'
            fallbackClassName='text-2xl font-bold'
          />
        </div>
      }
      contentBeforeInfo={
        <div className='flex gap-3 w-full mb-4 mt-2'>
          <Button
            variant={buttonState.variant}
            disabled={
              buttonState.disabled ||
              sendRequestMutation.isPending ||
              acceptRequestMutation.isPending ||
              cancelRequestMutation.isPending
            }
            onClick={handleFriendAction}
            className='flex-1 font-bold h-9 rounded-md border-none shadow-none transition-all active:scale-95'
          >
            {buttonState.label}
          </Button>
          <Button
            variant='secondary-blue'
            className='flex-1 font-bold h-9 rounded-md border-none shadow-none transition-all active:scale-95'
            onClick={() => {
               if (friendshipStatus?.status === FriendStatus.Accepted || (friendshipStatus?.friendshipId && friendshipStatus?.status)) {
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
              }
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
        </>
      }
    />
  )
}
