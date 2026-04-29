import { Loader2, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import {
  MESSAGE_SEARCH_SECTION,
  useMessageSearchInfinite,
  DateFilter,
  type DateFilterText,
  EmptyState,
  MessageResultCard,
  MessageResultSkeleton,
  SenderFilter,
  type SearchParticipant,
  type SenderFilterText
} from '@/features/search'
import { useChatText } from '../../i18n/use-chat-text'
import { useConversationParticipantsInfinite } from '../../queries/use-queries'
import { Button } from '@/components/ui/button'

interface SearchSidebarProps {
  conversationId: string
  onClose: () => void
  onNavigateToMessage: (messageId: string, keyword: string) => void
}

export function SearchSidebar({ conversationId, onClose, onNavigateToMessage }: SearchSidebarProps) {
  const { text } = useChatText()
  const sText = text.searchSidebar
  const [memberQuery, setMemberQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()

  const debouncedMemberQuery = useDebounce(memberQuery, 300)
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300)

  const searchRequest = {
    keyword: debouncedSearchKeyword,
    conversationId,
    senderId: selectedSenderId || undefined,
    from: fromDate?.getTime(),
    to: toDate?.getTime()
  }

  const hasFilters = !!(debouncedSearchKeyword || selectedSenderId || fromDate || toDate)

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage: fetchNextMessagesPage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage
  } = useMessageSearchInfinite(searchRequest, MESSAGE_SEARCH_SECTION.Messages, hasFilters)

  const {
    data: fileResults,
    isLoading: isLoadingFiles,
    fetchNextPage: fetchNextFilesPage,
    hasNextPage: hasNextFilesPage,
    isFetchingNextPage: isFetchingNextFilesPage
  } = useMessageSearchInfinite(searchRequest, MESSAGE_SEARCH_SECTION.Files, hasFilters)

  const { data: participantsData, isLoading: isLoadingParticipants } = useConversationParticipantsInfinite(
    conversationId,
    debouncedMemberQuery
  )

  const participants = participantsData?.pages.flatMap((page) => page.data) || []
  const displayedMessages = messagesData?.pages.flatMap((page) => page.data) || []
  const displayedFiles = fileResults?.pages.flatMap((page) => page.data) || []

  const hasMessages = displayedMessages.length > 0
  const hasFiles = displayedFiles.length > 0
  const hasResults = hasMessages || hasFiles

  const isLoadingInitial = hasFilters && (isLoadingMessages || isLoadingFiles)

  const canLoadMoreMessages = !!hasNextMessagesPage
  const canLoadMoreFiles = !!hasNextFilesPage

  const handleMessageLoadMore = () => {
    void fetchNextMessagesPage()
  }

  const handleFileLoadMore = () => {
    void fetchNextFilesPage()
  }

  const senderFilterText: SenderFilterText = {
    filterSender: sText.filterSender,
    placeholder: sText.placeholder,
    emptyStateSearch: text.emptyStateSearch,
    you: text.you
  }

  const dateFilterText: DateFilterText = {
    filterDate: sText.filterDate,
    timeSuggestion: sText.timeSuggestion,
    last7Days: sText.last7Days,
    last30Days: sText.last30Days,
    last3Months: sText.last3Months,
    chooseTimeRange: sText.chooseTimeRange,
    fromDate: sText.fromDate,
    toDate: sText.toDate,
    cancel: sText.cancel,
    confirm: sText.confirm
  }

  return (
    <div className='flex flex-col h-full bg-background'>
      <div className='h-[68px] border-b border-border flex items-center px-4 shrink-0 shadow-sm relative'>
        <h2 className='text-[16px] font-semibold text-text-primary text-center w-full px-10 truncate'>{sText.title}</h2>
        <button
          onClick={onClose}
          className='p-2 hover:bg-muted rounded-full transition-colors absolute right-4 top-1/2 -translate-y-1/2'
        >
          <X className='w-5 h-5 text-text-primary' />
        </button>
      </div>

      <div className='flex-1 flex flex-col py-4 overflow-y-auto custom-scrollbar overflow-x-hidden'>
        <div className='mx-4 grid grid-cols-[auto_1fr_auto] items-center h-8 relative bg-(--input-field-bg-filled) px-3 rounded-[5px] transition-colors duration-80 group'>
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

        <div className='mx-4 flex items-center gap-2 py-[10px] shrink-0'>
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
              participants={participants as SearchParticipant[]}
              text={senderFilterText}
            />

            <DateFilter
              fromDate={fromDate}
              toDate={toDate}
              setFromDate={setFromDate}
              setToDate={setToDate}
              text={dateFilterText}
            />
          </div>
        </div>

        <div className='flex-1 flex flex-col mt-4 gap-6 overflow-y-auto custom-scrollbar'>
          {!hasFilters ? (
            <div className='px-4'>
              <EmptyState image='/images/search_empty_keyword_state.png' text={sText.emptyStateText} />
            </div>
          ) : isLoadingInitial ? (
            <div className='flex flex-col'>
              {Array.from({ length: 6 }).map((_, i) => (
                <MessageResultSkeleton key={i} />
              ))}
            </div>
          ) : !hasResults ? (
            <div className='px-4'>
              <EmptyState image='/images/search_empty_state.png' text={text.emptyStateSearch} />
            </div>
          ) : (
            <>
              {hasMessages && (
                <section className='flex flex-col'>
                  <h3 className='px-4 pb-2 text-[15px] font-semibold text-text-primary'>{sText.messages}</h3>
                  {displayedMessages.map((msg) => (
                    <MessageResultCard
                      key={msg.messageId}
                      msg={msg}
                      showSenderOnly
                      isActive={activeMessageId === msg.messageId}
                      onClick={() => {
                        setActiveMessageId(msg.messageId)
                        onNavigateToMessage(msg.messageId, searchKeyword)
                      }}
                    />
                  ))}

                  {isLoadingMessages && !isLoadingInitial ? (
                    <div className='flex flex-col'>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <MessageResultSkeleton key={`messages-loading-${i}`} />
                      ))}
                    </div>
                  ) : canLoadMoreMessages ? (
                    <Button
                      variant='secondary'
                      onClick={handleMessageLoadMore}
                      disabled={isFetchingNextMessagesPage}
                      className='mx-3 mt-3 text-[13px]'
                    >
                      {isFetchingNextMessagesPage ? (
                        <Loader2 className='w-4 h-4 animate-spin mx-auto' />
                      ) : (
                        sText.loadMore || 'View more'
                      )}
                    </Button>
                  ) : null}
                </section>
              )}

              {hasFiles && (
                <section className='flex flex-col'>
                  <h3 className='px-4 pb-2 text-[15px] font-semibold text-text-primary'>{sText.files}</h3>
                  {displayedFiles.map((msg) => (
                    <MessageResultCard
                      key={msg.messageId}
                      msg={msg}
                      variant='file'
                      isActive={activeMessageId === msg.messageId}
                      onClick={() => {
                        setActiveMessageId(msg.messageId)
                        onNavigateToMessage(msg.messageId, searchKeyword)
                      }}
                    />
                  ))}

                  {isLoadingFiles && !isLoadingInitial ? (
                    <div className='flex flex-col'>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <MessageResultSkeleton key={`files-loading-${i}`} variant='file' />
                      ))}
                    </div>
                  ) : canLoadMoreFiles ? (
                    <Button
                      variant='secondary'
                      onClick={handleFileLoadMore}
                      disabled={isFetchingNextFilesPage}
                      className='mx-3 mt-3 text-[13px]'
                    >
                      {isFetchingNextFilesPage ? (
                        <Loader2 className='w-4 h-4 animate-spin mx-auto' />
                      ) : (
                        sText.loadMore || 'View more'
                      )}
                    </Button>
                  ) : null}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
