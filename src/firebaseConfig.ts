import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)

let analytics = null
try {
  analytics = getAnalytics(app)
} catch (e) {
  console.warn('Firebase Analytics is not supported:', e)
}

let messagingPromise: Promise<any> | null = null

export async function getMessagingInstance() {
  if (typeof window === 'undefined') return null

  if (!messagingPromise) {
    messagingPromise = (async () => {
      try {
        const supported = await isSupported()
        if (supported) {
          return getMessaging(app)
        }
      } catch (err) {
        console.warn('Firebase Messaging support check failed:', err)
      }
      return null
    })()
  }
  return messagingPromise
}

export { app, analytics }
