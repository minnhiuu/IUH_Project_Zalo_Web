import { useEffect, useRef } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/firebaseConfig'
import { useRegisterDeviceMutation } from '@/features/notification/queries/use-mutations'
import { storage, STORAGE_KEYS } from '@/utils/local-storage'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { notificationKeys } from '@/features/notification/queries/keys'
import { useTranslation } from 'react-i18next'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export function useFCM(onForegroundMessage?: (payload: unknown) => void, onNotificationClick?: () => void) {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const { mutateAsync: registerDevice } = useRegisterDeviceMutation()
  const registerDeviceRef = useRef(registerDevice)
  useEffect(() => {
    registerDeviceRef.current = registerDevice
  }, [registerDevice])
  const queryClient = useQueryClient()
  const userId = user?.id

  // Use refs to avoid re-triggering effect when callbacks change
  const onForegroundMessageRef = useRef(onForegroundMessage)
  const onNotificationClickRef = useRef(onNotificationClick)

  useEffect(() => {
    onForegroundMessageRef.current = onForegroundMessage
    onNotificationClickRef.current = onNotificationClick
  }, [onForegroundMessage, onNotificationClick])

  useEffect(() => {
    let isMounted = true

    async function initFCM() {
      try {
        if (!userId) return

        if (!('Notification' in window)) return

        if (Notification.permission === 'denied') return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        if (!('serviceWorker' in navigator)) return

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        })
        await navigator.serviceWorker.ready

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        })

        if (token && isMounted) {
          try {
            let deviceId = storage.get<string>(STORAGE_KEYS.DEVICE_ID)
            if (!deviceId) {
              deviceId = crypto.randomUUID()
              storage.set(STORAGE_KEYS.DEVICE_ID, deviceId)
            }

            await registerDeviceRef.current({
              token,
              platform: 'WEB',
              deviceId: deviceId,
              locale: i18n.language
            })
            if (isMounted) {
              storage.set(STORAGE_KEYS.FCM_TOKEN, token)
              storage.set(STORAGE_KEYS.FCM_REGISTERED_USER_ID, userId)
              console.log('[FCM] Registration successful with deviceId:', deviceId)
            }
          } catch (mutationError) {
            console.error('[FCM] Registration failed:', mutationError)
          }
        }
      } catch (error) {
        console.error('[FCM] Error during initFCM:', error)
      }
    }

    initFCM()

    const unsubscribe = onMessage(messaging, (payload) => {
      queryClient.refetchQueries({
        queryKey: notificationKeys.all,
        type: 'active'
      })
      onForegroundMessageRef.current?.(payload)
    })

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FCM_BACKGROUND_MESSAGE') {
        queryClient.refetchQueries({
          queryKey: notificationKeys.all,
          type: 'active'
        })
        onForegroundMessageRef.current?.(event.data.payload)
      } else if (event.data?.type === 'FCM_CLICK_ACTION') {
        if (event.data.action === 'OPEN_NOTIFICATIONS') {
          onNotificationClickRef.current?.()
        }
      }
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

    return () => {
      isMounted = false
      unsubscribe()
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
    }
  }, [userId, queryClient, i18n.language])
  // Success/Error of registerDevice doesn't change its reference
}
