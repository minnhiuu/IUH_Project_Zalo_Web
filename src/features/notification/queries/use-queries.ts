import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getMyNotificationsOptions, getNotificationStateOptions } from './options'
import { useTranslation } from 'react-i18next'

export const useMyNotificationsQuery = (limit: number = 10) => {
  const { i18n } = useTranslation()
  return useInfiniteQuery(getMyNotificationsOptions(limit, i18n.language))
}

export const useNotificationStateQuery = () => {
  return useQuery(getNotificationStateOptions())
}
