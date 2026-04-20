import { useEffect } from 'react'
import { onMessage } from 'firebase/messaging'
import { messaging } from '@/firebaseConfig'

interface UseCallNotificationOptions {
  onIncomingCall: (data: { sessionId: string; callerName: string; callerAvatar: string }) => void
}

export function useCallNotification({ onIncomingCall }: UseCallNotificationOptions) {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      const data = payload.data
      if (data?.type === 'CALL' && data.sessionId) {
        onIncomingCall({
          sessionId: data.sessionId,
          callerName: data.callerName || data.actorName || 'Unknown',
          callerAvatar: data.callerAvatar || data.actorAvatar || ''
        })
      }
    })

    return () => unsubscribe()
  }, [onIncomingCall])
}
