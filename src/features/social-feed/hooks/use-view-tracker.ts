import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { interactionApi } from '../api/interaction.api'

/**
 * Tracks when an element enters the viewport and records a VIEW interaction.
 *
 * - Fires at most ONCE per component lifecycle (tracked via a ref flag).
 * - Requires the element to be in view for at least `delayMs` milliseconds
 *   before making the API call (default: 1000ms).
 *
 * @returns `ref` — attach to the element you want to observe.
 */
export function useViewTracker(postId: string, delayMs = 500) {
  const hasFired = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { ref, inView } = useInView({
    threshold: 0.5
  })

  useEffect(() => {
    if (hasFired.current) return

    if (inView) {
      timerRef.current = setTimeout(() => {
        if (hasFired.current) return
        hasFired.current = true
        interactionApi.recordView(postId).catch(() => {
          // Silently ignore — view tracking is best-effort
        })
      }, delayMs)
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [inView, postId, delayMs])

  return { ref }
}
