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
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Tin nhắn mới'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: payload.data?.actorAvatar || payload.notification?.icon || origin + '/images/logo.png',
    badge: origin + '/images/logo.png',
    data: payload.data,
    tag: payload.notification?.tag || payload.data?.type
  }

  // Gửi message vào trang web nếu tab đang mở để cập nhật UI realtime
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    // KHÔNG THÔNG BÁO: Nếu đã tắt Chrome hoặc đóng hết các tab ứng dụng
    if (clientList.length === 0) {
      console.log('[SW] App is closed. Skipping notification.')
      return
    }

    clientList.forEach((client) => {
      client.postMessage({
        type: 'FCM_BACKGROUND_MESSAGE',
        payload
      })
    })

    // KIỂM TRA FOCUS: Nếu bạn đang mở tab ứng dụng và đang nhìn vào đó (focused)
    // thì cũng không cần hiện banner thông báo của trình duyệt nữa.
    const isAnyClientFocused = clientList.some((client) => client.focused)
    if (isAnyClientFocused) {
      console.log('[SW] App is focused. Skipping notification banner.')
      return
    }

    // HIỂN THỊ THÔNG BÁO: Khi tab đang mở nhưng bạn đang ở tab khác hoặc thu nhỏ trình duyệt.
    return self.registration.showNotification(notificationTitle, notificationOptions)
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
