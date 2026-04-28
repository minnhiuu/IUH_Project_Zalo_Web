import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useInfiniteGlobalSearchFiles } from '../../queries/use-queries'
import { MessageResultSkeleton, MessageResultCard } from '@/components/common/search/message-result-card'
import { EmptyState } from '@/components/common/search/empty-state'
import { useInView } from 'react-intersection-observer'
import { DateFilter, type DateFilterText } from '@/components/common/search/date-filter'
import { FileTypeFilter, type FileType } from '@/components/common/search/file-type-filter'
import { useGlobalSearchContext } from '../global-search-context'
import type { GlobalSearchRequest } from '../../api/global-search.api'

export const FilesTab = () => {
  const navigate = useNavigate()
  const { keyword, text, onClose } = useGlobalSearchContext()
  const { ref, inView } = useInView()

  // Filter states
  const [selectedFileType, setSelectedFileType] = useState<FileType | null>(null)
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)

  const request = useMemo<GlobalSearchRequest>(
    () => ({
      keyword,
      fileType: selectedFileType || undefined,
      from: fromDate?.getTime(),
      to: toDate?.getTime()
    }),
    [keyword, selectedFileType, fromDate, toDate]
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteGlobalSearchFiles(request)

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const files = data?.pages.flatMap((page) => page.data) || []

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
      {/* Filters Sticky Header - Always Visible */}
      <div className='flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background sticky top-0 z-10 overflow-x-auto no-scrollbar'>
        <span className='text-[13px] text-text-secondary shrink-0'>{text.filters.label}</span>
        <div className='flex-1 grid grid-cols-2 gap-2 min-w-0'>
          <FileTypeFilter value={selectedFileType} onChange={setSelectedFileType} text={{ filterType: text.filters.type }} />
          <DateFilter fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} text={dateFilterText} />
        </div>
      </div>

      {/* Results Section */}
      <div className='flex flex-col'>
        {isLoading && files.length === 0 ? (
          <div className='flex flex-col p-4 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <MessageResultSkeleton key={i} />
            ))}
          </div>
        ) : files.length > 0 ? (
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
