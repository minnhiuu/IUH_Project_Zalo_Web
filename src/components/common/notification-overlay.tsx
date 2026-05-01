import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NotificationToast } from './notification-toast'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'

export function NotificationOverlay() {
  const [notifications, setNotifications] = useState<(NotificationGroupResponse & { key: string })[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.key !== id))
  }, [])

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationGroupResponse>
      const data = customEvent.detail
      const key = `${data.id}-${Date.now()}`

      setNotifications((prev) => {
        // Prevent duplicates if already showing this notification ID
        if (prev.some((n) => n.id === data.id)) return prev

        const next = [...prev, { ...data, key }]
        return next.slice(-3)
      })

      // Auto remove after 6 seconds
      setTimeout(() => {
        removeNotification(key)
      }, 6000)
    }

    window.addEventListener('notification:received', handleNotification)
    return () => window.removeEventListener('notification:received', handleNotification)
  }, [removeNotification])

  return (
    <div className='fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none'>
      <AnimatePresence mode='popLayout'>
        {notifications.map((notification) => (
          <motion.div
            key={notification.key}
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className='pointer-events-auto'
          >
            <NotificationToast data={notification} onClose={() => removeNotification(notification.key)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
