import { useChatText } from '../i18n/use-chat-text'

interface SystemFriendshipCardProps {
  partnerName: string
  partnerAvatar?: string | null
  ownerAvatar?: string | null
  onSendGreeting?: () => void
}

export function SystemFriendshipCard({
  partnerName,
  partnerAvatar,
  ownerAvatar,
  onSendGreeting
}: SystemFriendshipCardProps) {
  const { text } = useChatText()
  const displayPartnerName = partnerName || text.systemFriendship.defaultPartnerName

  return (
    <div className='flex justify-center w-full my-4'>
      <div className='bg-white dark:bg-zinc-800 rounded-xl px-5 py-4 w-[340px] shadow-sm border border-black/5 text-center'>
        <div className='flex justify-center -space-x-3 mb-3'>
          <img
            src={ownerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=owner`}
            className='w-14 h-14 rounded-full border-2 border-white relative z-10'
            alt='You'
          />
          <img
            src={partnerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${partnerName}`}
            className='w-14 h-14 rounded-full border-2 border-white relative object-cover bg-white'
            alt={displayPartnerName}
          />
        </div>
        <p className='text-[15px] font-semibold text-foreground mb-1'>{text.systemFriendship.cardTitle}</p>
        <p className='text-sm text-muted-foreground mb-4'>
          {text.systemFriendship.cardDescription(displayPartnerName)}
        </p>
        <button
          onClick={onSendGreeting}
          className='w-full py-2 bg-vibrant-blue text-white rounded-lg text-sm font-semibold hover:bg-vibrant-blue/90 cursor-pointer transition-colors'
        >
          {text.systemFriendship.sendGreeting}
        </button>
      </div>
    </div>
  )
}
