import { Loader2, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { MESSAGE_SEARCH_SECTION } from '../../../search/messages'
import { useChatText } from '../../i18n/use-chat-text'
import { useConversationParticipantsInfinite } from '../../queries/use-queries'
import { useMessageSearchInfinite, useMessageSearchOverview } from '../../../search/messages'
import { DateFilter } from './date-filter'
import { EmptyState } from './empty-state'
import { MessageResultCard, MessageResultSkeleton } from './message-result-card'
import { SenderFilter } from './sender-filter'
import { Button } from '@/components/ui/button'

interface SearchSidebarProps {
  conversationId: string
  onClose: () => void
  onNavigateToMessage: (messageId: string, keyword: string) => void
}

const INITIAL_SECTION_SIZE = 5

export function SearchSidebar({ conversationId, onClose, onNavigateToMessage }: SearchSidebarProps) {
  const { text } = useChatText()
  const sText = text.searchSidebar
  const [memberQuery, setMemberQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [expandedSections, setExpandedSections] = useState<{ messages: boolean; files: boolean }>({
    messages: false,
    files: false
  })
  const debouncedMemberQuery = useDebounce(memberQuery, 300)
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300)

  const searchRequest = {
    keyword: debouncedSearchKeyword,
    conversationId,
    senderId: selectedSenderId || undefined,
    from: fromDate?.toISOString(),
    to: toDate?.toISOString()
  }

  const hasFilters = !!(debouncedSearchKeyword || selectedSenderId || fromDate || toDate)

  const { data: overviewData, isLoading: isLoadingOverview } = useMessageSearchOverview(
    searchRequest,
    INITIAL_SECTION_SIZE,
    hasFilters
  )

  const {
    data: messageResults,
    isLoading: isLoadingMessages,
    fetchNextPage: fetchNextMessagesPage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage
  } = useMessageSearchInfinite(searchRequest, MESSAGE_SEARCH_SECTION.Messages, hasFilters && expandedSections.messages)

  const {
    data: fileResults,
    isLoading: isLoadingFiles,
    fetchNextPage: fetchNextFilesPage,
    hasNextPage: hasNextFilesPage,
    isFetchingNextPage: isFetchingNextFilesPage
  } = useMessageSearchInfinite(searchRequest, MESSAGE_SEARCH_SECTION.Files, hasFilters && expandedSections.files)

  const { data: participantsData, isLoading: isLoadingParticipants } = useConversationParticipantsInfinite(
    conversationId,
    debouncedMemberQuery
  )

  const participants = participantsData?.pages.flatMap((page) => page.data) || []
  const overviewMessages = overviewData?.messages.data || []
  const overviewFiles = overviewData?.files.data || []
  const pagedMessages = messageResults?.pages.flatMap((page) => page.data) || []
  const pagedFiles = fileResults?.pages.flatMap((page) => page.data) || []

  const displayedMessages = expandedSections.messages && pagedMessages.length > 0 ? pagedMessages : overviewMessages
  const displayedFiles = expandedSections.files && pagedFiles.length > 0 ? pagedFiles : overviewFiles

  const hasMessages = displayedMessages.length > 0
  const hasFiles = displayedFiles.length > 0
  const hasResults = hasMessages || hasFiles

  const canLoadMoreMessages = expandedSections.messages
    ? !!hasNextMessagesPage
    : (overviewData?.messages.totalItems || 0) > overviewMessages.length

  const canLoadMoreFiles = expandedSections.files
    ? !!hasNextFilesPage
    : (overviewData?.files.totalItems || 0) > overviewFiles.length

  const handleMessageLoadMore = () => {
    if (expandedSections.messages) {
      void fetchNextMessagesPage()
      return
    }

    setExpandedSections((prev) => ({ ...prev, messages: true }))
  }

  const handleFileLoadMore = () => {
    if (expandedSections.files) {
      void fetchNextFilesPage()
      return
    }

    setExpandedSections((prev) => ({ ...prev, files: true }))
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

      <div className='flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar overflow-x-hidden'>
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

            <DateFilter
              fromDate={fromDate}
              toDate={toDate}
              setFromDate={setFromDate}
              setToDate={setToDate}
              sText={sText}
            />
          </div>
        </div>

        <div className='flex-1 flex flex-col mt-4 gap-6 overflow-y-auto custom-scrollbar'>
          {!hasFilters ? (
            <EmptyState image='/images/search_empty_keyword_state.png' text={sText.emptyStateText} />
          ) : isLoadingOverview ? (
            <div className='flex flex-col'>
              {Array.from({ length: 6 }).map((_, i) => (
                <MessageResultSkeleton key={i} />
              ))}
            </div>
          ) : !hasResults ? (
            <EmptyState image='/images/search_empty_state.png' text={text.emptyStateSearch} />
          ) : (
            <>
              {hasMessages && (
                <section className='flex flex-col'>
                  <h3 className='px-3 pb-2 text-[15px] font-semibold text-text-primary'>Messages</h3>
                  {displayedMessages.map((msg) => (
                    <MessageResultCard
                      key={msg.messageId}
                      msg={msg}
                      onClick={() => onNavigateToMessage(msg.messageId, searchKeyword)}
                    />
                  ))}

                  {expandedSections.messages && isLoadingMessages ? (
                    <div className='flex flex-col'>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <MessageResultSkeleton key={`messages-loading-${i}`} />
                      ))}
                    </div>
                  ) : canLoadMoreMessages ? (
                    <Button
                      variant={'secondary'}
                      onClick={handleMessageLoadMore}
                      disabled={isFetchingNextMessagesPage}
                      className='mx-3 mt-3 py-3 text-[13px] font-medium'
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
                  <h3 className='px-3 pb-2 text-[15px] font-semibold text-text-primary'>File</h3>
                  {displayedFiles.map((msg) => (
                    <MessageResultCard
                      key={msg.messageId}
                      msg={msg}
                      onClick={() => onNavigateToMessage(msg.messageId, searchKeyword)}
                    />
                  ))}

                  {expandedSections.files && isLoadingFiles ? (
                    <div className='flex flex-col'>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <MessageResultSkeleton key={`files-loading-${i}`} />
                      ))}
                    </div>
                  ) : canLoadMoreFiles ? (
                    <button
                      onClick={handleFileLoadMore}
                      disabled={isFetchingNextFilesPage}
                      className='mx-3 mt-3 py-3 text-[13px] font-medium text-text-primary bg-(--layer-background-secondary) hover:bg-(--layer-background-hover) rounded-[6px] transition-colors disabled:opacity-50'
                    >
                      {isFetchingNextFilesPage ? (
                        <Loader2 className='w-4 h-4 animate-spin mx-auto' />
                      ) : (
                        sText.loadMore || 'View more'
                      )}
                    </button>
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
