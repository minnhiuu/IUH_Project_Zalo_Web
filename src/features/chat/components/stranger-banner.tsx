import { UserPlus, UserMinus, Check, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useFriendshipStatus,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useSendFriendRequest
} from '@/features/friend/queries'
import { useChatText } from '../i18n/use-chat-text'
import { FriendStatus } from '@/features/friend/schemas/friend.schema'
import { useAuthContext } from '@/features/auth/context/auth-context'

interface StrangerBannerProps {
  partnerId: string
  partnerName: string
}

export function StrangerBanner({ partnerId, partnerName }: StrangerBannerProps) {
  const { user: currentUser } = useAuthContext()
  const { text } = useChatText()
  const { data: friendshipStatus, isLoading } = useFriendshipStatus(partnerId)

  const sendRequestMutation = useSendFriendRequest()
  const acceptRequestMutation = useAcceptFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()

  if (isLoading || !currentUser) return null

  // Nếu đã kết bạn, không hiện banner
  if (friendshipStatus?.status === FriendStatus.Accepted) return null

  return (
    <div className='flex items-center justify-between px-4 py-2.5 bg-[#F6F7F8] dark:bg-zinc-900 border-b border-border shadow-sm z-0 text-[13px] text-muted-foreground'>
      <div className='flex items-center gap-2 font-medium text-foreground/80'>
        <UserPlus className='w-[16px] h-[16px] text-muted-foreground' />
        {(!friendshipStatus?.status ||
          friendshipStatus.status === FriendStatus.Declined ||
          friendshipStatus.status === FriendStatus.Cancelled) && <span>{text['stranger-banner'].sendRequestHint}</span>}
        {friendshipStatus?.status === FriendStatus.Pending && friendshipStatus.requestedBy === currentUser.id && (
          <span>{text['stranger-banner'].sentRequestTo(partnerName)}</span>
        )}
        {friendshipStatus?.status === FriendStatus.Pending && friendshipStatus.requestedBy !== currentUser.id && (
          <span>{text['stranger-banner'].receivedRequest}</span>
        )}
      </div>

      <div className='flex items-center gap-2'>
        {(!friendshipStatus?.status ||
          friendshipStatus.status === FriendStatus.Declined ||
          friendshipStatus.status === FriendStatus.Cancelled) && (
          <Button
            variant='secondary'
            size='sm'
            className='h-[28px] text-[13px] font-medium tracking-wide bg-[#EAE8E8] hover:bg-[#DEDFE0] text-[#000000] border-none px-4 rounded-[4px]'
            onClick={() => sendRequestMutation.mutate({ receiverId: partnerId })}
            disabled={sendRequestMutation.isPending}
          >
            {text['stranger-banner'].sendRequest}
          </Button>
        )}

        {friendshipStatus?.status === FriendStatus.Pending && friendshipStatus.requestedBy === currentUser.id && (
          <Button
            variant='secondary'
            size='sm'
            className='h-[28px] text-[13px] font-medium tracking-wide bg-[#EAE8E8] hover:bg-[#DEDFE0] text-[#000000] border-none px-4 rounded-[4px]'
            onClick={() => cancelRequestMutation.mutate(friendshipStatus.friendshipId || '')}
            disabled={cancelRequestMutation.isPending}
          >
            <UserMinus className='w-[14px] h-[14px] mr-1.5' /> {text['stranger-banner'].cancelRequest}
          </Button>
        )}

        {friendshipStatus?.status === FriendStatus.Pending && friendshipStatus.requestedBy !== currentUser.id && (
          <Button
            variant='secondary-blue'
            size='sm'
            className='h-[28px] text-[13px] font-medium tracking-wide bg-[#E5EFFF] text-[#005AE0] hover:bg-[#D4E4FC] border-none px-4 rounded-[4px]'
            onClick={() => acceptRequestMutation.mutate(friendshipStatus.friendshipId || '')}
            disabled={acceptRequestMutation.isPending}
          >
            <Check className='w-[14px] h-[14px] mr-1.5' /> {text['stranger-banner'].acceptRequest}
          </Button>
        )}

        <button className='w-[28px] h-[28px] flex items-center justify-center bg-[#EAE8E8] hover:bg-[#DEDFE0] rounded-[4px] text-muted-foreground'>
          <MoreHorizontal className='w-4 h-4 text-foreground/80' />
        </button>
      </div>
    </div>
  )
}
