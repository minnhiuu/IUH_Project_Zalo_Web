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

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  const origin = self.location.origin
  const notificationTitle = 'BondHub - ' + (payload.notification?.title || 'BondHub')
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || payload.data?.actorAvatar || origin + '/images/logo.png',
    badge: origin + '/images/logo.png',
    data: payload.data,
    tag: payload.notification?.tag
  }

  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage({
        type: 'FCM_BACKGROUND_MESSAGE',
        payload
      })
    })

    if (clientList.length === 0) return

    self.registration.showNotification(notificationTitle, notificationOptions)
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
