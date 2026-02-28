import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'
import { QUERY_POLICIES } from '@/constants'
import type { NotificationFlatHistoryResponse, NotificationHistoryResponse } from '../schemas/notification.schema'

export const getMyNotificationsOptions = (limit: number = 10, lng: string = 'vi', filter: 'ALL' | 'UNREAD' = 'ALL') =>
  infiniteQueryOptions({
    queryKey: notificationKeys.my({ limit, lng, filter }),
    queryFn: ({ pageParam = null }): Promise<NotificationHistoryResponse | NotificationFlatHistoryResponse> => {
      const params = { cursor: pageParam as string | null, limit }
      return filter === 'UNREAD'
        ? notificationApi.getUnreadHistory(params).then((res) => res.data.data)
        : notificationApi.getNotificationHistory(params).then((res) => res.data.data)
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined
    },
    initialPageParam: null as string | null,
    ...QUERY_POLICIES.INFINITE
  })

export const getNotificationStateOptions = () =>
  queryOptions({
    queryKey: notificationKeys.state(),
    queryFn: () => notificationApi.getNotificationState().then((res) => res.data.data),
    ...QUERY_POLICIES.LIST
  })
