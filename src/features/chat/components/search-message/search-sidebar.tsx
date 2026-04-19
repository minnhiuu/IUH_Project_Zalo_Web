import { Loader2, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { useChatText } from '../../i18n/use-chat-text'
import { useConversationParticipantsInfinite } from '../../queries/use-queries'
import { useMessageSearchInfinite } from '../../../search/messages'
import { DateFilter } from './date-filter'
import { EmptyState } from './empty-state'
import { MessageResultCard, MessageResultSkeleton } from './message-result-card'
import { SenderFilter } from './sender-filter'

interface SearchSidebarProps {
  conversationId: string
  onClose: () => void
}

export function SearchSidebar({ conversationId, onClose }: SearchSidebarProps) {
  const { text } = useChatText()
  const sText = text.searchSidebar
  const [memberQuery, setMemberQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const debouncedMemberQuery = useDebounce(memberQuery, 300)
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300)

  // Message Search Query
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMessageSearchInfinite(
    {
      keyword: debouncedSearchKeyword,
      conversationId,
      senderId: selectedSenderId || undefined,
      from: fromDate?.toISOString(),
      to: toDate?.toISOString()
    },
    !!debouncedSearchKeyword || !!selectedSenderId || !!fromDate || !!toDate
  )

  const { data: participantsData, isLoading: isLoadingParticipants } = useConversationParticipantsInfinite(
    conversationId,
    debouncedMemberQuery
  )
  const participants = participantsData?.pages.flatMap((page) => page.data) || []
  const allResults = searchResults?.pages.flatMap((page) => page.data) || []
  const hasFilters = !!(debouncedSearchKeyword || selectedSenderId || fromDate || toDate)

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Header */}
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
        {/* Search Input */}
        <div className='grid grid-cols-[auto_1fr_auto] items-center h-8 relative bg-input-field-bg-outline px-3 border border-border-subtle rounded-[5px] transition-colors duration-80 group focus-within:border-primary'>
          <Search className='w-4 h-4 text-text-primary transition-colors mr-2' />
          <input
            type='text'
            placeholder={sText.placeholder}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className='w-full h-full bg-transparent border-none outline-none text-[13px] font-medium text-text-primary placeholder:text-muted-foreground/60'
            autoFocus
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className='ml-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none font-medium'
            >
              {sText.clear}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className='flex items-center gap-2 py-[10px] shrink-0'>
          <span className='text-text-secondary text-[13px] font-normal cursor-default whitespace-nowrap'>
            {sText.filterLabel}
          </span>

          <div className='flex-1 grid grid-cols-2 gap-2 items-center'>
            <SenderFilter
              selectedSenderId={selectedSenderId}
              setSelectedSenderId={setSelectedSenderId}
              memberQuery={memberQuery}
              setMemberQuery={setMemberQuery}
              isLoadingParticipants={isLoadingParticipants}
              participants={participants}
              sText={sText}
              text={text}
            />

            <DateFilter fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} sText={sText} />
          </div>
        </div>

        {/* Search Results Area */}
        <div className='flex-1 flex flex-col mt-4 gap-4 overflow-y-auto custom-scrollbar'>
          {!hasFilters ? (
            <EmptyState image='/images/search_empty_keyword_state.png' text={sText.emptyStateText} />
          ) : isLoadingSearch ? (
            <div className='flex flex-col'>
              {Array.from({ length: 6 }).map((_, i) => (
                <MessageResultSkeleton key={i} />
              ))}
            </div>
          ) : allResults.length === 0 ? (
            <EmptyState image='/images/search_empty_state.png' text={text.emptyStateSearch} />
          ) : (
            <div className='flex flex-col'>
              {allResults.map((msg) => (
                <MessageResultCard key={msg.messageId} msg={msg} />
              ))}

              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className='py-4 text-[13px] text-primary hover:text-primary-semibold transition-colors disabled:opacity-50'
                >
                  {isFetchingNextPage ? (
                    <Loader2 className='w-4 h-4 animate-spin mx-auto' />
                  ) : (
                    sText.loadMore || 'Xem thêm'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
