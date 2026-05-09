importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: 'AIzaSyBNr-OCpXI42eguU6x0aWgajpYIWF4Vzr4',
  authDomain: 'bondhub-9e8e1.firebaseapp.com',
  projectId: 'bondhub-9e8e1',
  storageBucket: 'bondhub-9e8e1.firebasestorage.app',
  messagingSenderId: '1004895767731',
  appId: '1:1004895767731:web:3daead0ceab5d6c40af4c6',
  measurementId: 'G-W9TP9GZHTX'
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Helper to interact with IndexedDB in SW
const DB_NAME = 'fcm_auth_db'
const STORE_NAME = 'auth_state'

function getAuthState() {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME)
    request.onsuccess = (e) => {
      const db = e.target.result
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const getReq = store.get('current_user')
      getReq.onsuccess = () => resolve(getReq.result)
      getReq.onerror = () => resolve(null)
    }
    request.onerror = () => resolve(null)
  })
}

function setAuthState(data) {
  const request = indexedDB.open(DB_NAME, 1)
  request.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME)
  request.onsuccess = (e) => {
    const db = e.target.result
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(data, 'current_user')
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USER') {
    setAuthState({
      userId: event.data.userId,
      expiresAt: event.data.expiresAt // Thêm thời điểm hết hạn
    })
    console.log('[SW] Auth state updated')
  } else if (event.data && event.data.type === 'CLEAR_USER') {
    setAuthState(null)
    console.log('[SW] Auth state cleared')
  }
})

messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Background message received:', payload)

  const authState = await getAuthState()
  const now = Date.now()

  // 1. Session Expiry & Recipient Validation
  if (!authState || (authState.expiresAt && now > authState.expiresAt)) {
    console.warn('[SW] Blocking notification: No active session or session expired')
    return
  }

  const recipientId = payload.data?.recipientId
  if (recipientId && authState.userId !== recipientId) {
    console.warn(`[SW] Blocking notification: recipient mismatch (${recipientId} vs ${authState.userId})`)
    return
  }

  const origin = self.location.origin
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Tin nhắn mới'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: payload.data?.actorAvatar || payload.notification?.icon || origin + '/images/logo.jpg',
    badge: origin + '/images/logo.jpg',
    data: payload.data,
    tag:
      payload.data?.summaryGroupKey ||
      payload.data?.conversationId ||
      payload.data?.notificationId ||
      payload.messageId ||
      payload.data?.type
  }

  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage({
        type: 'FCM_BACKGROUND_MESSAGE',
        payload
      })
    })

    if (payload.notification) {
      return
    }

    return self.registration.showNotification(notificationTitle, notificationOptions)
  })
})

function getNotificationData(notification) {
  const data = notification?.data || {}
  const fcmData = data.FCM_MSG?.data || data.data || data

  if (typeof fcmData.dataString === 'string') {
    try {
      return JSON.parse(fcmData.dataString)
    } catch (e) {
      console.warn('[SW] Failed to parse dataString:', e)
    }
  }

  if (typeof fcmData.payload === 'string') {
    try {
      return { ...fcmData, ...JSON.parse(fcmData.payload) }
    } catch (e) {
      console.warn('[SW] Failed to parse payload:', e)
    }
  }

  return fcmData
}

function buildTargetUrl(data) {
  const origin = self.location.origin
  const type = data?.type
  const conversationId =
    data?.conversationId ||
    data?.conversation_id ||
    data?.conversation?.id ||
    (type === 'MESSAGE_DIRECT' || type === 'MESSAGE_GROUP' ? data?.referenceId : undefined)

  // Handle chat messages
  if ((type === 'MESSAGE_DIRECT' || type === 'MESSAGE_GROUP') && conversationId) {
    return `${origin}/chat/c/${encodeURIComponent(conversationId)}`
  }

  // Handle friend requests and system notifications
  if (type === 'FRIEND_REQUEST' || type === 'FRIEND_ACCEPT') {
    const url = new URL(`${origin}/notifications`)
    if (data?.notificationId) {
      url.searchParams.set('highlight', data.notificationId)
    }
    return url.href
  }

  // Handle custom URL if provided
  if (data?.url) {
    try {
      return new URL(data.url, origin).href
    } catch (e) {
      console.warn('[SW] Invalid notification url, falling back to notifications:', data.url)
    }
  }

  // Default fallback: navigate to notifications page
  const fallback = new URL(`${origin}/notifications`)
  if (data?.notificationId) {
    fallback.searchParams.set('highlight', data.notificationId)
  }
  return fallback.href
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = getNotificationData(event.notification)
  const url = buildTargetUrl(data)

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Tìm tab đang mở
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            return client.navigate(url).then((navigatedClient) => {
              if (navigatedClient && 'focus' in navigatedClient) {
                return navigatedClient.focus()
              }
              return client.focus()
            })
          }

          client.postMessage({
            type: 'FCM_CLICK_ACTION',
            action: 'OPEN_URL',
            url
          })
          return client.focus()
        }
      }

      // Nếu không có tab nào mở thì mở mới
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
