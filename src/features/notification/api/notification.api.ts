import type {
  CreateFriendRequestNotificationRequest,
  NotificationAcceptedResponse,
  NotificationHistoryResponse
} from '@/features/notification/schemas/notification.schema'
import type { DeviceTokenRequest } from '@/features/notification/schemas/user-device.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const notificationApi = {
  registerDevice: (body: DeviceTokenRequest) => http.post<ApiResponse<string>>('/notifications/devices', body),

  unregisterDevice: (userId: string, token: string) =>
    http.delete<ApiResponse<string>>('/notifications/devices', {
      params: { userId, token }
    }),

  createFriendRequest: (body: CreateFriendRequestNotificationRequest) =>
    http.post<ApiResponse<NotificationAcceptedResponse>>('/notifications/friend-request', body),

  getMyNotifications: async (params: { cursor?: string | null; limit?: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return http.get<ApiResponse<NotificationHistoryResponse>>('/notifications/history', { params })
  },

  markAsRead: (notificationId: string) => http.patch<ApiResponse<void>>(`/notifications/${notificationId}/read`)
}
