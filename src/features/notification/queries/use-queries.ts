import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getMyNotificationsOptions, getNotificationStateOptions } from './options'
import { useTranslation } from 'react-i18next'

export const useMyNotificationsQuery = (limit: number = 10, filter: 'all' | 'unread' = 'all') => {
  const { i18n } = useTranslation()
  const apiFilter = filter === 'unread' ? 'UNREAD' : 'ALL'
  return useInfiniteQuery(getMyNotificationsOptions(limit, i18n.language, apiFilter))
}

export const useNotificationStateQuery = () => {
  return useQuery(getNotificationStateOptions())
}
