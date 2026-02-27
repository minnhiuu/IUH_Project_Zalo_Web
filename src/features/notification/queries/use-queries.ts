import { useInfiniteQuery } from '@tanstack/react-query'
import { getMyNotificationsOptions } from './options'

export const useMyNotificationsQuery = (size: number = 10) => {
  return useInfiniteQuery(getMyNotificationsOptions(size))
}
