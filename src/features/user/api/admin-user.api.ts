import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  AdminUserListItem,
  AdminUserDetailResponse,
  BanUserRequest,
  UserFilterParams
} from '@/features/user/schemas/admin-user.schema'
import type { AuditLog } from '@/features/user/schemas/audit-log.schema'

export const adminUserApi = {
  getAllUsers: (params?: UserFilterParams) => {
    const { name, phone, email, status, ...rest } = params ?? {}
    return http.get<ApiResponse<PageResponse<AdminUserListItem>>>('/admin/users', {
      params: {
        ...rest,
        name: name || undefined,
        phone: phone || undefined,
        email: email || undefined,
        status: status || undefined
      }
    })
  },

  getUserDetail: (userId: string) =>
    http.get<ApiResponse<AdminUserDetailResponse>>(`/admin/users/${userId}`),

  getUserActivityLogs: (userId: string, params?: { page?: number; size?: number }) =>
    http.get<ApiResponse<PageResponse<AuditLog>>>(`/admin/users/${userId}/activity-logs`, { params }),

  // POST — matches @PostMapping on backend
  banUser: (userId: string, data: BanUserRequest) =>
    http.post<ApiResponse<void>>(`/admin/users/${userId}/ban`, data),

  unbanUser: (userId: string) =>
    http.post<ApiResponse<void>>(`/admin/users/${userId}/unban`)
}
