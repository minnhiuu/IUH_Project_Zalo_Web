import type {
  NotificationHistoryResponse,
  UserNotificationStateResponse,
  NotificationFlatHistoryResponse
} from '@/features/notification/schemas/notification.schema'
import type { DeviceTokenRequest } from '@/features/notification/schemas/user-device.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const notificationApi = {
  registerDevice: (body: DeviceTokenRequest) => http.post<ApiResponse<string>>('/notifications/devices', body),

  unregisterDevice: (token: string) =>
    http.delete<ApiResponse<string>>('/notifications/devices', {
      params: { token }
    }),

  getNotificationHistory: (params: { cursor?: string | null; limit?: number }) =>
    http.get<ApiResponse<NotificationHistoryResponse>>('/notifications/history', { params }),

  getUnreadHistory: (params: { cursor?: string | null; limit?: number }) =>
    http.get<ApiResponse<NotificationFlatHistoryResponse>>('/notifications/history/unread', { params }),

  getNotificationState: () => http.get<ApiResponse<UserNotificationStateResponse>>('/notifications/state'),

  markHistoryAsChecked: () => http.post<ApiResponse<void>>('/notifications/checked'),

  markAsRead: (notificationId: string) => http.post<ApiResponse<void>>(`/notifications/${notificationId}/read`),

  markChatConversationAsRead: (conversationId: string) =>
    http.post<ApiResponse<void>>(`/notifications/conversations/${conversationId}/read`),

  markAllAsRead: () => http.post<ApiResponse<void>>('/notifications/read-all')
}
