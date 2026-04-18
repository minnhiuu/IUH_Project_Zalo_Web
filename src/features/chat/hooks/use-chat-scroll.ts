import { useRef, useCallback, useState, type RefObject } from 'react'

export const useChatScroll = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  suppressFetchRef
}: {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  suppressFetchRef?: RefObject<boolean>
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    if (suppressFetchRef?.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current

    // In a flex-col-reverse container, scrollTop starts at 0 (bottom).
    // When scrolling up, it goes negative (or positive in some browsers but mostly negative in standard scrolling).
    // The distance from the "top" of the actual content is measured by `scrollHeight - clientHeight - Math.abs(scrollTop)`.
    const distanceFromBottom = Math.abs(scrollTop)
    setIsAtBottom(distanceFromBottom < 80)

    if (Math.abs(scrollTop) >= scrollHeight - clientHeight - 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, suppressFetchRef])

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { scrollRef, handleScroll, isAtBottom, scrollToBottom }
}
