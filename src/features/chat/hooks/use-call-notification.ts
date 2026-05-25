import { useEffect } from 'react'
import { onMessage } from 'firebase/messaging'
import { messaging } from '@/firebaseConfig'

interface UseCallNotificationOptions {
  onIncomingCall: (data: { sessionId: string; callerName: string; callerAvatar: string; callKind?: 'voice' | 'video' }) => void
}

export function useCallNotification({ onIncomingCall }: UseCallNotificationOptions) {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      const data = payload.data
      if (data?.type === 'CALL' && data.sessionId) {
        onIncomingCall({
          sessionId: data.sessionId,
          callerName: data.callerName || data.actorName || 'Unknown',
          callerAvatar: data.callerAvatar || data.actorAvatar || '',
          callKind: (data.callKind as 'voice' | 'video' | undefined) || 'voice'
        })
      }
    })

    const handleIncomingEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        sessionId?: string
        callerName?: string
        callerAvatar?: string
        callKind?: 'voice' | 'video'
      }
      if (detail?.sessionId) {
        onIncomingCall({
          sessionId: detail.sessionId,
          callerName: detail.callerName || 'Unknown',
          callerAvatar: detail.callerAvatar || '',
          callKind: detail.callKind || 'voice'
        })
      }
    }

    window.addEventListener('incoming-call', handleIncomingEvent)

    return () => {
      unsubscribe()
      window.removeEventListener('incoming-call', handleIncomingEvent)
    }
  }, [onIncomingCall])
}
