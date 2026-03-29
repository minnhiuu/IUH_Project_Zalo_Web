import { useRef, useCallback } from 'react'

export const useChatScroll = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}: {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current

    // In a flex-col-reverse container, scrollTop starts at 0 (bottom).
    // When scrolling up, it goes negative (or positive in some browsers but mostly negative in standard scrolling).
    // The distance from the "top" of the actual content is measured by `scrollHeight - clientHeight - Math.abs(scrollTop)`.
    if (Math.abs(scrollTop) >= scrollHeight - clientHeight - 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return { scrollRef, handleScroll }
}
