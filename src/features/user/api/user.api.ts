import type { UserResponse, UserUpdateRequest, UserImageResponse } from '@/features/user/schemas/user.schema'
import type { AuditLog } from '@/features/user/schemas/audit-log.schema'
import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'

export const userApi = {
  getMyProfile: () => http.get<ApiResponse<UserResponse>>('/users/me'),
  updateMyProfile: (body: UserUpdateRequest) => http.put<ApiResponse<UserResponse>>('/users/me', body),
  updateAvatar: (body: FormData) => http.patch<ApiResponse<UserImageResponse>>('/users/profile/avatar', body),
  updateBackground: (body: FormData) => http.patch<ApiResponse<UserImageResponse>>('/users/profile/background', body),
  updateBackgroundPosition: (y: number) =>
    http.patch<ApiResponse<UserImageResponse>>(`/users/profile/background/position?y=${y}`),

  getUserById: (id: string) => http.get<ApiResponse<UserResponse>>(`/users/${id}`),

  // Audit Logs
  getMyAuditLogs: (params?: { page?: number; size?: number }) =>
    http.get<ApiResponse<PageResponse<AuditLog>>>('/audit-logs', { params }),

  getUserAuditLogs: (userId: string, params?: { page?: number; size?: number }) =>
    http.get<ApiResponse<PageResponse<AuditLog>>>(`/audit-logs/${userId}`, { params }),

  sendFriendRequest: (receiverId: string) =>
    http.post<ApiResponse<void>>('/friendships/requests', { receiverId, message: 'Xin chào, kết bạn với mình nhé!' }),

  acceptFriendRequest: (requestId: string) => http.put<ApiResponse<void>>(`/friendships/requests/${requestId}/accept`),

  declineFriendRequest: (requestId: string) => http.put<ApiResponse<void>>(`/friendships/requests/${requestId}/decline`)
}
