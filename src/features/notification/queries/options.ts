import { infiniteQueryOptions } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'
import { QUERY_POLICIES } from '@/constants'

export const getMyNotificationsOptions = (size: number = 10) =>
  infiniteQueryOptions({
    queryKey: notificationKeys.my({ size }),
    queryFn: ({ pageParam = 0 }) =>
      notificationApi.getMyNotifications({ page: pageParam as number, size }).then((res) => res.data.data),
    getNextPageParam: (lastPage) => {
      if (lastPage.page + 1 < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 0,
    ...QUERY_POLICIES.INFINITE
  })
