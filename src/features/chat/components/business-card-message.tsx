import { Phone, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import { UserAvatar } from '@/components/common/user-avatar'
import type { BusinessCardPayload } from '../utils/business-card'
import { useChatText } from '../i18n/use-chat-text'

interface BusinessCardMessageProps {
  payload: BusinessCardPayload
}

export function BusinessCardMessage({ payload }: BusinessCardMessageProps) {
  const { text } = useChatText()
  const bc = text.businessCard
  const navigate = useNavigate()
  const qrValue = payload.qrValue || `bondhub://user/${payload.userId}?name=${encodeURIComponent(payload.name || '')}`
  const handleOpenDirectConversation = () => {
    if (!payload.userId) return
    navigate(`/chat/u/${payload.userId}`)
  }

  return (
    <div className='w-76.25 overflow-hidden rounded-xl border border-[#C8D7EB] bg-card shadow-sm'>
      <div 
        className='relative flex min-h-28 items-center gap-3 overflow-hidden bg-linear-to-br from-[#0C6DE8] to-[#2A7CEE] px-4 py-3 cursor-pointer'
        onClick={() => {
          handleOpenDirectConversation()
        }}
      >
        <div className='absolute -right-6 -top-7 h-28 w-28 rounded-full bg-white/10' />
        <div className='absolute right-12 top-5 h-20 w-20 rounded-full bg-white/10' />

        <UserAvatar src={payload.avatar || undefined} name={payload.name || text.user} className='h-12 w-12 border border-white/50' />

        <div className='min-w-0 flex-1'>
          <div className='truncate text-[18px]/[1.2] font-semibold text-white'>{payload.name || text.user}</div>
          {payload.phone ? <div className='truncate text-[15px]/[1.2] text-white/95'>{payload.phone}</div> : null}
        </div>

        <div className='flex h-14 w-14 items-center justify-center rounded-md bg-white p-1.5'>
          <QRCodeSVG value={qrValue} size={44} />
        </div>
      </div>

      <div className='grid h-13 grid-cols-2 bg-[#E7F0FC] dark:bg-[#213247]'>
        <button
          type='button'
          disabled={!payload.phone}
          onClick={() => {
            if (!payload.phone) return
            window.open(`tel:${payload.phone}`, '_self')
          }}
          className='flex items-center justify-center gap-1.5 border-r border-[#C8D7EB] dark:border-[#35506E] text-[15px] font-semibold text-[#1F2937] dark:text-[#E5EDF9] disabled:cursor-not-allowed disabled:opacity-60'
        >
          <Phone size={16} />
          {bc.call}
        </button>

        <button
          type='button'
          onClick={() => {
            handleOpenDirectConversation()
          }}
          className='flex items-center justify-center gap-1.5 text-[15px] font-semibold text-[#1F2937] dark:text-[#E5EDF9]'
        >
          <MessageCircle size={16} />
          {bc.message}
        </button>
      </div>
    </div>
  )
}
