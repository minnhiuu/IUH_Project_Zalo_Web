import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'
import type {
  NotificationHistoryResponse,
  UserNotificationStateResponse,
  NotificationGroupResponse,
  NotificationFlatHistoryResponse
} from '../schemas/notification.schema'

export const useRegisterDeviceMutation = () =>
  useMutation({
    mutationFn: notificationApi.registerDevice
  })

export const useUnregisterDeviceMutation = () =>
  useMutation({
    mutationFn: (token: string) => notificationApi.unregisterDevice(token)
  })


export const useMarkHistoryAsCheckedMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markHistoryAsChecked,
    onSuccess: () => {
      queryClient.setQueriesData<UserNotificationStateResponse>({ queryKey: notificationKeys.state() }, (oldState) => {
        if (!oldState) return oldState
        return { ...oldState, unreadCount: 0 }
      })

      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: (_, notificationId) => {
      queryClient.setQueriesData<InfiniteData<NotificationHistoryResponse | NotificationFlatHistoryResponse>>(
        { queryKey: [...notificationKeys.all, 'my'] },
        (old) => {
          if (!old || !old.pages) return old

          const newPages = old.pages.map((page) => {
            if ('items' in page) {
              return {
                ...page,
                items: page.items.filter((item: NotificationGroupResponse) => item.id !== notificationId)
              }
            }

            const updateList = (list: NotificationGroupResponse[]) =>
              list &&
              list.map((n) => {
                if (n.id === notificationId && !n.read) {
                  return { ...n, read: true }
                }
                return n
              })

            return {
              ...page,
              newest: updateList(page.newest) || [],
              today: updateList(page.today) || [],
              previous: updateList(page.previous) || []
            }
          })

          return { ...old, pages: newPages }
        }
      )
    }
  })
}

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      // 1. Update all notification history queries
      queryClient.setQueriesData<InfiniteData<NotificationHistoryResponse | NotificationFlatHistoryResponse>>(
        { queryKey: [...notificationKeys.all, 'my'] },
        (old) => {
          if (!old || !old.pages) return old

          const newPages = old.pages.map((page) => {
            // For flat response (UNREAD tab), clear everything
            if ('items' in page) {
              return { ...page, items: [] }
            }

            // For grouped response (ALL tab), mark everything as read
            const markAll = (list: NotificationGroupResponse[]) => list && list.map((n) => ({ ...n, read: true }))
            return {
              ...page,
              newest: markAll(page.newest) || [],
              today: markAll(page.today) || [],
              previous: markAll(page.previous) || []
            }
          })
          return { ...old, pages: newPages }
        }
      )

      // 2. Reset unread count to 0
      queryClient.setQueriesData<UserNotificationStateResponse>({ queryKey: notificationKeys.state() }, (oldState) => {
        if (!oldState) return oldState
        return { ...oldState, unreadCount: 0 }
      })
    }
  })
}
