import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/firebaseConfig'
import { useRegisterDeviceMutation } from '@/features/notification/queries/use-mutations'
import { storage, STORAGE_KEYS } from '@/utils/local-storage'
import type { UserResponse } from '@/features/user/schemas/user.schema'
import { useQueryClient } from '@tanstack/react-query'
import { notificationKeys } from '@/features/notification/queries/keys'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export function useFCM(onForegroundMessage?: (payload: unknown) => void) {
  const registerDeviceMutation = useRegisterDeviceMutation()
  const queryClient = useQueryClient()

  useEffect(() => {
    async function initFCM() {
      try {
        const userId = storage.get<UserResponse>(STORAGE_KEYS.USER_PROFILE)?.id
        if (!userId) return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('[FCM] Notification permission denied')
          return
        }

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        })

        if (token && userId) {
          const storedToken = storage.get(STORAGE_KEYS.FCM_TOKEN)
          if (storedToken !== token) {
            storage.set(STORAGE_KEYS.FCM_TOKEN, token)
            try {
              await registerDeviceMutation.mutateAsync({ userId, token, platform: 'WEB' })
              console.log('[FCM] Device registered:', token)
            } catch (error) {
              storage.remove(STORAGE_KEYS.FCM_TOKEN)
              throw error
            }
          } else {
            console.log('[FCM] Device already registered with this token')
          }
        }
      } catch (error) {
        console.error('[FCM] Error initializing:', error)
      }
    }

    initFCM()

    // Foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.warn('[FCM] Foreground message received:', payload)
      queryClient.refetchQueries({
        queryKey: notificationKeys.all,
        type: 'active'
      })
      onForegroundMessage?.(payload)
    })

    // Background messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FCM_BACKGROUND_MESSAGE') {
        console.warn('[FCM] Signal from Service Worker received:', event.data.payload)
        queryClient.refetchQueries({
          queryKey: notificationKeys.all,
          type: 'active'
        })
        onForegroundMessage?.(event.data.payload)
      }
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

    return () => {
      unsubscribe()
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
    }
  }, [onForegroundMessage, queryClient, registerDeviceMutation])
}
