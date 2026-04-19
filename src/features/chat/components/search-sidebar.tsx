import { X, Search, User, Calendar, ChevronDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useChatText } from '../i18n/use-chat-text'
import { useConversationParticipantsInfinite } from '../queries/use-queries'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/common/user-avatar'

interface SearchSidebarProps {
  conversationId: string
  onClose: () => void
}

export function SearchSidebar({ conversationId, onClose }: SearchSidebarProps) {
  const { text } = useChatText()
  const sText = text.searchSidebar
  const [memberQuery, setMemberQuery] = useState('')

  const { data: participantsData, isLoading: isLoadingParticipants } = useConversationParticipantsInfinite(
    conversationId,
    memberQuery
  )
  const participants = participantsData?.pages.flatMap((page) => page.data) || []

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Header - Fixed layout to prevent truncation */}
      <div className='h-[68px] border-b border-border flex items-center px-4 shrink-0 shadow-sm relative'>
        <h2 className='text-[16px] font-semibold text-text-primary text-center w-full px-10 truncate'>{sText.title}</h2>
        <button
          onClick={onClose}
          className='p-2 hover:bg-muted rounded-full transition-colors absolute right-4 top-1/2 -translate-y-1/2'
        >
          <X className='w-5 h-5 text-text-primary' />
        </button>
      </div>

      <div className='flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar overflow-x-hidden'>
        {/* Search Input - Using design variables via Tailwind */}
        <div className='grid grid-cols-[auto_1fr_auto] items-center h-8 relative bg-input-field-bg-outline px-3 border border-border-subtle rounded-[5px] transition-colors duration-80 group focus-within:border-primary'>
          <Search className='w-4 h-4 text-text-primary transition-colors mr-2' />
          <input
            type='text'
            placeholder={sText.placeholder}
            className='w-full h-full bg-transparent border-none outline-none text-[14px] text-text-primary placeholder:text-muted-foreground/60'
            autoFocus
          />
        </div>

        {/* Filters - Responsive Flex Layout */}
        <div className='flex items-center gap-2 py-[10px] overflow-x-auto no-scrollbar shrink-0'>
          <span className='text-text-secondary text-[13px] font-normal cursor-default whitespace-nowrap'>
            {sText.filterLabel}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex h-[24px] !min-h-[24px] !max-h-[24px] px-3 bg-button-secondary-neutral-normal text-button-secondary-neutral-text text-[13px] font-normal leading-none rounded-[3px] hover:bg-button-secondary-neutral-hover transition-colors items-center gap-2 outline-none shrink-0 border-none cursor-pointer'>
                <User className='w-4 h-4 shrink-0' />
                <span className='truncate max-w-[80px]'>{sText.filterSender}</span>
                <ChevronDown className='w-4 h-4 ml-0.5 opacity-60' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='w-52 p-2 bg-background border border-border shadow-md rounded-[8px] z-50'
            >
              {/* Search Member Input */}
              <div className='relative flex items-center h-8 mb-2 mx-0.5'>
                <Search className='absolute left-3 w-4 h-4 text-muted-foreground/60' />
                <input
                  type='text'
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder={sText.placeholder}
                  className='w-full h-full pl-9 pr-3 bg-(--input-field-bg-filled) border-none outline-none rounded-[20px] text-[13px] text-text-primary placeholder:text-muted-foreground/50'
                />
              </div>

              <div className='max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-0.5'>
                {isLoadingParticipants ? (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
                  </div>
                ) : participants.length > 0 ? (
                  participants.map((participant) => (
                    <DropdownMenuItem
                      key={participant.userId}
                      className='h-[32px] px-[8px] rounded-[4px] gap-2 focus:bg-(--layer-background-hover) focus:text-text-primary cursor-pointer my-0.5'
                    >
                      <UserAvatar
                        name={participant.fullName || text.you}
                        src={participant.avatar}
                        className='w-6 h-6'
                      />
                      <span className='flex-1 text-[13px] text-text-primary truncate font-medium min-w-0'>
                        {participant.isMe ? text.you : (participant.fullName || 'User')}
                      </span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className='py-4 text-center text-sm text-muted-foreground'>{text.emptyStateSearch}</div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select>
            <SelectTrigger className='!h-[24px] !min-h-[24px] !max-h-[24px] !px-3 !bg-button-secondary-neutral-normal !text-button-secondary-neutral-text text-[13px] font-normal leading-none !rounded-[3px] hover:!bg-button-secondary-neutral-hover transition-colors !gap-2 !shadow-none !border-none focus:ring-0 shrink-0 w-auto !py-0 cursor-pointer'>
              <div className='flex items-center gap-1.5'>
                <Calendar className='w-4 h-4 shrink-0 text-button-secondary-neutral-text' />
                <div className='truncate max-w-[80px] text-left'>
                  <SelectValue placeholder={sText.filterTime} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all' className='text-[13px] text-text-primary'>
                {sText.filterTime}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Empty State - No Animation */}
        <div className='flex-1 flex flex-col items-center justify-center p-8 mt-4'>
          <div className='relative mb-6'>
            <div className='absolute inset-0 bg-primary/5 rounded-full blur-3xl' />
            <img
              src='/images/search_empty_keyword_state.png'
              alt='Empty search'
              className='w-48 h-48 object-contain relative z-10 opacity-90 dark:opacity-80'
            />
          </div>
          <p className='text-[14px] text-muted-foreground text-center max-w-[280px] leading-relaxed select-none'>
            {sText.emptyStateText}
          </p>
        </div>
      </div>
    </div>
  )
}
