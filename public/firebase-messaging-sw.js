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

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  const origin = self.location.origin
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Tin nhắn mới'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: payload.data?.actorAvatar || payload.notification?.icon || origin + '/images/logo.jpg',
    badge: origin + '/images/logo.jpg',
    data: payload.data,
    tag: payload.messageId || payload.data?.type
  }

  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage({
        type: 'FCM_BACKGROUND_MESSAGE',
        payload
      })
    })

    return self.registration.showNotification(notificationTitle, notificationOptions)
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Tìm tab đang mở
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'FCM_CLICK_ACTION',
            action: 'OPEN_NOTIFICATIONS'
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
