import { useRef, useCallback, useState, type RefObject } from 'react'

export const useChatScroll = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  fetchPreviousPage,
  hasPreviousPage,
  isFetchingPreviousPage,
  suppressFetchRef
}: {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchPreviousPage?: () => void
  hasPreviousPage?: boolean
  isFetchingPreviousPage?: boolean
  suppressFetchRef?: RefObject<boolean>
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    if (suppressFetchRef?.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const scrollableDistance = scrollHeight - clientHeight

    // In a flex-col-reverse container, scrollTop starts at 0 (bottom).
    // When scrolling up, it goes negative (or positive in some browsers but mostly negative in standard scrolling).
    const distanceFromBottom = Math.abs(scrollTop)
    setIsAtBottom(distanceFromBottom < 80)

    if (distanceFromBottom < 100) {
      if (hasPreviousPage && !isFetchingPreviousPage && fetchPreviousPage) {
        fetchPreviousPage()
      }
    }

    if (scrollableDistance > 100 && Math.abs(scrollTop) >= scrollableDistance - 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    suppressFetchRef
  ])

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const resetToBottom = useCallback(() => {
    setIsAtBottom(true)
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return { scrollRef, handleScroll, isAtBottom, scrollToBottom, resetToBottom }
}
