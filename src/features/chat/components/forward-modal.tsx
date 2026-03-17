import { useState } from 'react'
import { Search, X, Forward, Check } from 'lucide-react'
import { useConversationsQuery } from '../queries/use-queries'
import { useChatContext } from '../context/chat-context'
import type { MessageResponse } from '../schemas/chat.schema'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ForwardModalProps {
  message: MessageResponse
  onClose: () => void
}

export function ForwardModal({ message, onClose }: ForwardModalProps) {
  const { data: conversations } = useConversationsQuery()
  const { sendMessage } = useChatContext()
  const [search, setSearch] = useState('')
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([])

  const filteredConversations = conversations?.filter((c) =>
    c.partnerName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (partnerId: string) => {
    setSelectedPartnerIds((prev) =>
      prev.includes(partnerId) ? prev.filter((id) => id !== partnerId) : prev.length < 20 ? [...prev, partnerId] : prev
    )
  }

  const handleForward = () => {
    selectedPartnerIds.forEach((partnerId) => {
      // Forwarding logic: send a new message with isForwarded=true
      sendMessage(partnerId, message.content, null, true)
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[420px] p-0 gap-0 overflow-hidden'>
        <DialogHeader className='p-4 border-b'>
          <DialogTitle className='text-[17px] font-bold'>Chuyển tiếp tin nhắn</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className='p-3 border-b bg-muted/20'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm kiếm người nhắn...'
              className='w-full pl-9 pr-4 py-2 bg-background border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
            />
          </div>
        </div>

        {/* List */}
        <div className='max-h-[350px] overflow-y-auto'>
          {filteredConversations?.map((conv) => (
            <div
              key={conv.partnerId}
              onClick={() => handleToggle(conv.partnerId)}
              className='flex items-center px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors'
            >
              <img
                src={conv.partnerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${conv.partnerId}`}
                alt=''
                className='w-10 h-10 rounded-full object-cover border'
              />
              <div className='ml-3 flex-1'>
                <p className='text-[14px] font-medium'>{conv.partnerName}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                  selectedPartnerIds.includes(conv.partnerId)
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30'
                )}
              >
                {selectedPartnerIds.includes(conv.partnerId) && <Check size={12} className='text-white' />}
              </div>
            </div>
          ))}

          {filteredConversations?.length === 0 && (
            <div className='py-12 text-center text-sm text-muted-foreground'>Không tìm thấy cuộc trò chuyện nào</div>
          )}
        </div>

        <DialogFooter className='p-4 border-t flex items-center justify-between sm:justify-between bg-muted/10'>
          <div className='text-[13px] text-muted-foreground italic'>Đã chọn: {selectedPartnerIds.length}/20</div>
          <div className='flex gap-2'>
            <Button variant='ghost' size='sm' onClick={onClose}>
              Hủy
            </Button>
            <Button size='sm' onClick={handleForward} disabled={selectedPartnerIds.length === 0} className='gap-2'>
              <Forward size={16} />
              Chuyển tiếp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
