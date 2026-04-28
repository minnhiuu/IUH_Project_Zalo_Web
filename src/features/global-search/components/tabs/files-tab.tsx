import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useInfiniteGlobalSearchFiles, useGlobalSearchSenders } from '../../queries/use-queries'
import { MessageResultSkeleton, MessageResultCard } from '@/components/common/search/message-result-card'
import { EmptyState } from '@/components/common/search/empty-state'
import { useInView } from 'react-intersection-observer'
import { DateFilter, type DateFilterText } from '@/components/common/search/date-filter'
import { SenderFilter, type SearchParticipant, type SenderFilterText } from '@/components/common/search/sender-filter'
import { useGlobalSearchContext } from '../global-search-context'
import type { GlobalSearchRequest } from '../../api/global-search.api'

export const FilesTab = () => {
  const navigate = useNavigate()
  const { keyword, text, onClose } = useGlobalSearchContext()
  const { ref, inView } = useInView()

  // Filter states
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [memberQuery, setMemberQuery] = useState('')

  const request = useMemo<GlobalSearchRequest>(
    () => ({
      keyword,
      senderId: selectedSenderId || undefined,
      from: fromDate?.getTime(),
      to: toDate?.getTime()
    }),
    [keyword, selectedSenderId, fromDate, toDate]
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteGlobalSearchFiles(request)

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const files = data?.pages.flatMap((page) => page.data) || []

  // Use the new senders aggregation for the sender filter
  const { data: sendersData, isLoading: isLoadingSenders } = useGlobalSearchSenders(keyword)

  const participants = useMemo<SearchParticipant[]>(() => {
    if (!sendersData) return []

    return sendersData
      .filter((contact) => contact.recipientId !== null)
      .map((contact) => ({
        userId: contact.recipientId as string,
        fullName: contact.name,
        avatar: contact.avatar || null,
        isMe: false
      }))
  }, [sendersData])

  const filteredParticipants = useMemo(() => {
    if (!memberQuery) return participants
    return participants.filter((p) => p.fullName.toLowerCase().includes(memberQuery.toLowerCase()))
  }, [participants, memberQuery])

  const senderFilterText: SenderFilterText = {
    filterSender: text.filters.sender,
    placeholder: text.placeholder,
    emptyStateSearch: text.filters.all,
    you: text.filters.you
  }

  const dateFilterText: DateFilterText = {
    filterDate: text.filters.time,
    timeSuggestion: text.filters.timeSuggestion,
    last7Days: text.filters.last7Days,
    last30Days: text.filters.last30Days,
    last3Months: text.filters.last3Months,
    chooseTimeRange: text.filters.chooseTimeRange,
    fromDate: text.filters.fromDate,
    toDate: text.filters.toDate,
    cancel: text.filters.cancel,
    confirm: text.filters.confirm
  }

  if (isLoading && files.length === 0) {
    return (
      <div className='flex flex-col'>
        <div className='flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background sticky top-0 z-10'>
          <div className='h-8 w-20 bg-muted animate-pulse rounded' />
          <div className='h-8 w-20 bg-muted animate-pulse rounded' />
        </div>
        <div className='flex flex-col p-4 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <MessageResultSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col'>
      {/* Filter Header */}
      <div className='flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background sticky top-0 z-10'>
        <span className='text-[13px] text-text-secondary shrink-0'>{text.filters.label}</span>
        <SenderFilter
          selectedSenderId={selectedSenderId}
          setSelectedSenderId={setSelectedSenderId}
          memberQuery={memberQuery}
          setMemberQuery={setMemberQuery}
          isLoadingParticipants={isLoadingSenders}
          participants={filteredParticipants}
          text={senderFilterText}
        />
        <div className='w-px h-4 bg-border/60' />
        <DateFilter fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} text={dateFilterText} />
      </div>

      {/* Results */}
      <div className='flex flex-col'>
        {files.length > 0 ? (
          <>
            <div className='flex flex-col'>
              {files.map((message) => (
                <MessageResultCard
                  key={message.messageId}
                  msg={message}
                  variant='file'
                  onClick={() => {
                    navigate(`/chat/c/${message.conversationId}?msgId=${message.messageId}`)
                    onClose()
                  }}
                />
              ))}
            </div>

            {/* Load More Trigger */}
            <div ref={ref} className='h-10 flex items-center justify-center'>
              {isFetchingNextPage && <div className='w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin' />}
            </div>
          </>
        ) : (
          <div className='mt-20'>
            <EmptyState text={text.states.empty} />
          </div>
        )}
      </div>
    </div>
  )
}
