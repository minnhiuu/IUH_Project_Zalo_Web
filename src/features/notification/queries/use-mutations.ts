import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'
import type {
  NotificationHistoryResponse,
  UserNotificationStateResponse,
  NotificationGroupResponse
} from '../schemas/notification.schema'

export const useRegisterDeviceMutation = () =>
  useMutation({
    mutationFn: notificationApi.registerDevice
  })

export const useUnregisterDeviceMutation = () =>
  useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      notificationApi.unregisterDevice(userId, token)
  })

export const useCreateFriendRequestNotificationMutation = () =>
  useMutation({
    mutationFn: notificationApi.createFriendRequest
  })

export const useMarkHistoryAsCheckedMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markHistoryAsChecked,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueriesData<InfiniteData<NotificationHistoryResponse>>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old || !old.pages) return old

          let wasUnread = false
          const newPages = old.pages.map((page) => {
            const updateList = (list: NotificationGroupResponse[]) =>
              list &&
              list.map((n) => {
                if (n.id === notificationId && !n.read) {
                  wasUnread = true
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

          if (!wasUnread) return old

          queryClient.setQueriesData<UserNotificationStateResponse>(
            { queryKey: notificationKeys.state() },
            (oldState) => {
              if (!oldState) return oldState
              return {
                ...oldState,
                unreadCount: Math.max(0, oldState.unreadCount - 1)
              }
            }
          )

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
      // 1. Set all notifications as read in cache
      queryClient.setQueriesData<InfiniteData<NotificationHistoryResponse>>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old || !old.pages) return old

          const newPages = old.pages.map((page) => {
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
