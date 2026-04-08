import { useChatText } from '../i18n/use-chat-text'

type SystemFriendshipBadgeProps = {
  message: {
    content?: string | null
  }
  partnerName?: string | null
  otherUserId?: string | null
  currentUserId?: string | null
  requesterId?: string | null
  onOpenProfile: (id: string) => void
}

export function SystemFriendshipBadge({
  message,
  partnerName,
  otherUserId,
  currentUserId,
  requesterId,
  onOpenProfile
}: SystemFriendshipBadgeProps) {
  const { text } = useChatText()
  const effectiveRequesterId = requesterId || message.content
  const isRequester = !!currentUserId && currentUserId === effectiveRequesterId
  const displayPartnerName = partnerName || text.systemFriendship.defaultPartnerName
  const targetProfileId = isRequester ? otherUserId : effectiveRequesterId

  const handleOpenProfile = () => {
    if (!targetProfileId) return
    onOpenProfile(targetProfileId)
  }

  return (
    <div className='flex justify-center w-full my-2'>
      <div className='bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 px-4 py-1.5 rounded-full flex items-center gap-1.5 select-none'>
        <span className='text-[13px] text-gray-600'>
          {isRequester ? (
            <>
              <button
                onClick={handleOpenProfile}
                className='font-semibold hover:underline text-gray-800 focus:outline-none'
              >
                {displayPartnerName}
              </button>{' '}
              {text.systemFriendship.acceptedSuffix}
            </>
          ) : (
            <>
              {`${text.systemFriendship.becameFriendsPrefix} `}
              <button
                onClick={handleOpenProfile}
                className='font-semibold hover:underline text-gray-800 focus:outline-none'
              >
                {displayPartnerName}
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  )
}
