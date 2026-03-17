import { queryOptions } from '@tanstack/react-query'
import { adminUserApi } from '../api/admin-user.api'
import { adminUserKeys } from './admin-keys'
import type { UserFilterParams } from '../schemas/admin-user.schema'

export const adminUserQueries = {
  allUsers: (filters: UserFilterParams = {}) =>
    queryOptions({
      queryKey: adminUserKeys.list(filters),
      queryFn: () => adminUserApi.getAllUsers(filters)
    }),

  userDetail: (userId: string) =>
    queryOptions({
      queryKey: adminUserKeys.detail(userId),
      queryFn: () => adminUserApi.getUserDetail(userId),
      enabled: !!userId
    }),

  userActivityLogs: (userId: string, page = 0, size = 20) =>
    queryOptions({
      queryKey: adminUserKeys.activityLogs(userId, page),
      queryFn: () => adminUserApi.getUserActivityLogs(userId, { page, size }),
      enabled: !!userId
    })
}
