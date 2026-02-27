import type {
  CreateFriendRequestNotificationRequest,
  NotificationAcceptedResponse,
  NotificationGroupResponse
} from '@/features/notification/schemas/notification.schema'
import type { DeviceTokenRequest } from '@/features/notification/schemas/user-device.schema'
import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'

export const notificationApi = {
  registerDevice: (body: DeviceTokenRequest) => http.post<ApiResponse<string>>('/notifications/devices', body),

  unregisterDevice: (userId: string, token: string) =>
    http.delete<ApiResponse<string>>('/notifications/devices', {
      params: { userId, token }
    }),

  createFriendRequest: (body: CreateFriendRequestNotificationRequest) =>
    http.post<ApiResponse<NotificationAcceptedResponse>>('/notifications/friend-request', body),

  getMyNotifications: (params: { page?: number; size?: number; sort?: string }) =>
    http.get<ApiResponse<PageResponse<NotificationGroupResponse>>>('/notifications/me', { params }),

  markAsRead: (notificationId: string) => http.patch<ApiResponse<void>>(`/notifications/${notificationId}/read`)
}
