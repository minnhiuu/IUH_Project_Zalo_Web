import { useQuery } from '@tanstack/react-query'
import { adminUserQueries } from './admin-options'
import type { UserFilterParams } from '../schemas/admin-user.schema'

export const useAdminUsers = (filters: UserFilterParams = {}) => {
  return useQuery(adminUserQueries.allUsers(filters))
}

export const useAdminUserDetail = (userId: string) => {
  return useQuery(adminUserQueries.userDetail(userId))
}

export const useAdminUserActivityLogs = (userId: string, page = 0, size = 20) => {
  return useQuery(adminUserQueries.userActivityLogs(userId, page, size))
}
