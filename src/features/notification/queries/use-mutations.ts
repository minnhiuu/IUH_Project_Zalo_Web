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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.state() })
      const previousState = queryClient.getQueryData<UserNotificationStateResponse>(notificationKeys.state())

      queryClient.setQueryData<UserNotificationStateResponse>(notificationKeys.state(), (old) => {
        if (!old) return old

        const chatUnreadConversationCount = old.chatUnreadConversationCount ?? 0

        return {
          ...old,
          unreadCount: 0,
          notificationUnreadCount: 0,
          chatUnreadConversationCount,
          notificationBadgeCount: chatUnreadConversationCount
        }
      })

      return { previousState }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(notificationKeys.state(), context.previousState)
      }
    },
    onSuccess: () => {
      // Invalidate state query to recalculate counts
      queryClient.invalidateQueries({ queryKey: notificationKeys.state() })
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
                items: page.items.map((item: NotificationGroupResponse) => {
                  if (item.id === notificationId && !item.read) {
                    return { ...item, read: true }
                  }
                  return item
                })
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

      // Invalidate state query to recalculate unread counts
      queryClient.invalidateQueries({ queryKey: notificationKeys.state() })
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
            // For flat response (UNREAD tab), mark everything as read instead of clearing
            if ('items' in page) {
              return { ...page, items: page.items.map((n) => ({ ...n, read: true })) }
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

      // 2. Invalidate state query to recalculate counts
      queryClient.invalidateQueries({ queryKey: notificationKeys.state() })
    }
  })
}
