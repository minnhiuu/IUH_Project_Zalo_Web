import { useState, useEffect, useMemo } from 'react'
import { useInfiniteGlobalSearchMessages, useGlobalSearchSenders } from '../../queries/use-queries'
import { MessageResultSkeleton, MessageResultCard } from '@/features/search'
import { EmptyState } from '@/features/search'
import { useInView } from 'react-intersection-observer'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { SenderFilter, type SearchParticipant, type SenderFilterText } from '@/features/search'
import { DateFilter, type DateFilterText } from '@/features/search'
import { useGlobalSearchContext } from '../global-search-context'
import type { GlobalSearchRequest } from '../../api/global-search.api'
import { useAddSearchItem } from '../../../recent/queries/use-recent-queries'
import { SearchType } from '@/constants/enum'
import { generateKeywordId } from '../../../utils/search-id'

export const MessagesTab = () => {
  const navigate = useNavigate()
  const { keyword, text, activeItemId, setActiveItemId } = useGlobalSearchContext()
  const { mutate: addSearchItem } = useAddSearchItem()
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteGlobalSearchMessages(request)

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const messages = data?.pages.flatMap((page) => page.data) || []

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

  return (
    <div className='flex flex-col'>
      {/* Filter Header - Always Stable */}
      <div className='flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background sticky top-0 z-10'>
        <span className='text-[13px] text-text-secondary shrink-0'>{text.filters.label}</span>
        <div className='flex-1 flex items-center gap-2'>
          <SenderFilter
            selectedSenderId={selectedSenderId}
            setSelectedSenderId={setSelectedSenderId}
            memberQuery={memberQuery}
            setMemberQuery={setMemberQuery}
            isLoadingParticipants={isLoadingSenders}
            participants={filteredParticipants}
            text={senderFilterText}
          />
          <div className='w-px h-4 bg-border/60 shrink-0' />
          <DateFilter fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} text={dateFilterText} />
        </div>
      </div>

      <div className='flex flex-col'>
        {isLoading && messages.length === 0 ? (
          <div className='flex flex-col p-4 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <MessageResultSkeleton key={i} />
            ))}
          </div>
        ) : messages.length > 0 ? (
          <>
            <div className='px-4 py-3 shrink-0'>
              <h3 className='text-[15px] font-bold text-text-primary'>
                {text.sections.messages} ({data?.pages[0]?.totalItems || messages.length})
              </h3>
            </div>
            <div className='flex flex-col'>
              {messages.map((msg) => (
                <MessageResultCard
                  key={msg.messageId}
                  msg={msg}
                  isActive={activeItemId === msg.messageId}
                  onClick={() => {
                    if (keyword.trim()) {
                      addSearchItem({
                        id: generateKeywordId(keyword),
                        name: keyword.trim(),
                        type: SearchType.Keyword
                      })
                    }
                    setActiveItemId(msg.messageId)
                    addSearchItem({
                      id: msg.conversationId,
                      name: msg.conversationName || 'Conversation',
                      avatar: msg.conversationAvatar || undefined,
                      type: msg.isGroup ? SearchType.Group : SearchType.User
                    })
                    navigate(
                      `/chat/c/${msg.conversationId}?msgId=${msg.messageId}&keyword=${encodeURIComponent(
                        keyword
                      )}&showInfo=true`
                    )
                  }}
                />
              ))}
            </div>
            {hasNextPage && (
              <div ref={ref} className='py-4 flex justify-center'>
                <Loader2 className='w-6 h-6 animate-spin text-primary' />
              </div>
            )}
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
