import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'
import { QUERY_POLICIES } from '@/constants'

export const getMyNotificationsOptions = (limit: number = 10, lng: string = 'vi') =>
  infiniteQueryOptions({
    queryKey: notificationKeys.my({ limit, lng }),
    queryFn: ({ pageParam = null }) =>
      notificationApi.getMyNotifications({ cursor: pageParam as string | null, limit }).then((res) => res.data.data),
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
