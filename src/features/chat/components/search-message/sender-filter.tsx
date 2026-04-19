import { UserAvatar } from '@/components/common/user-avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ChevronDown, Loader2, Search, User, X } from 'lucide-react'
import type { ConversationParticipantResponse } from '../../schemas/chat.schema'
import { useChatText } from '../../i18n/use-chat-text'

interface SenderFilterProps {
  selectedSenderId: string | null
  setSelectedSenderId: (id: string | null) => void
  memberQuery: string
  setMemberQuery: (query: string) => void
  isLoadingParticipants: boolean
  participants: ConversationParticipantResponse[]
  sText: ReturnType<typeof useChatText>['text']['searchSidebar']
  text: ReturnType<typeof useChatText>['text']
}

export function SenderFilter({
  selectedSenderId,
  setSelectedSenderId,
  memberQuery,
  setMemberQuery,
  isLoadingParticipants,
  participants,
  sText,
  text
}: SenderFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex-1 flex h-[24px] !min-h-[24px] !max-h-[24px] px-1.5 text-[13px] font-normal leading-none rounded-[3px] transition-colors items-center justify-center gap-1 outline-none border-none cursor-pointer overflow-hidden',
            selectedSenderId
              ? 'bg-(--button-tertiary-neutral-focus-bg) text-(--button-tertiary-neutral-focus-text)'
              : 'bg-button-secondary-neutral-normal text-button-secondary-neutral-text hover:bg-button-secondary-neutral-hover'
          )}
        >
          <User className={cn('w-3.5 h-3.5 shrink-0', selectedSenderId ? 'text-current' : 'opacity-60')} />
          <span className='truncate min-w-0'>
            {selectedSenderId
              ? participants.find((p: ConversationParticipantResponse) => p.userId === selectedSenderId)?.fullName ||
                sText.filterSender
              : sText.filterSender}
          </span>
          {selectedSenderId ? (
            <div
              onClick={(e) => {
                e.stopPropagation()
                setSelectedSenderId(null)
              }}
              className='p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-auto'
            >
              <X className='w-3 h-3 text-current' />
            </div>
          ) : (
            <ChevronDown className='w-3.5 h-3.5 opacity-60 shrink-0 ml-auto' />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='w-52 p-2 bg-background border border-border shadow-md rounded-[8px] z-50'
      >
        <div className='relative flex items-center h-8 mb-2 mx-0.5'>
          <Search className='absolute left-3 w-4 h-4 text-muted-foreground/60' />
          <input
            type='text'
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder={sText.placeholder}
            className='w-full h-full pl-9 pr-3 bg-(--input-field-bg-filled) border-none outline-none rounded-[20px] text-[13px] font-medium text-text-primary placeholder:text-muted-foreground/50'
          />
        </div>

        <div className='max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-0.5'>
          {isLoadingParticipants ? (
            <div className='flex items-center justify-center py-4'>
              <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
            </div>
          ) : participants.length > 0 ? (
            participants.map((participant: ConversationParticipantResponse) => (
              <DropdownMenuItem
                key={participant.userId}
                onClick={() => setSelectedSenderId(participant.userId === selectedSenderId ? null : participant.userId)}
                className={cn(
                  'h-[32px] px-[8px] rounded-[4px] gap-2 focus:bg-(--layer-background-hover) cursor-pointer my-0.5',
                  selectedSenderId === participant.userId && 'bg-(--layer-background-hover)'
                )}
              >
                <UserAvatar name={participant.fullName || text.you} src={participant.avatar} className='w-6 h-6' />
                <span className='flex-1 text-[13px] text-text-primary truncate font-medium min-w-0'>
                  {participant.isMe ? text.you : participant.fullName || 'User'}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className='py-4 text-center text-sm text-muted-foreground'>{text.emptyStateSearch}</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
