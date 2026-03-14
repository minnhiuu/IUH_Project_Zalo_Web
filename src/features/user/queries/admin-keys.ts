import type { UserFilterParams } from '../schemas/admin-user.schema'

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters: UserFilterParams) => [...adminUserKeys.lists(), filters] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
  activityLogs: (userId: string, page: number) =>
    [...adminUserKeys.all, 'activity-logs', userId, page] as const
}
