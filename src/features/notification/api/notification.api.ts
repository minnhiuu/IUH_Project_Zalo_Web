import type { DeviceTokenRequest } from '@/features/notification/schemas/user-device.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const notificationApi = {
  registerDevice: (body: DeviceTokenRequest) => http.post<ApiResponse<string>>('/notifications/devices', body),

  unregisterDevice: (userId: string, token: string) =>
    http.delete<ApiResponse<string>>('/notifications/devices', {
      params: { userId, token }
    })
}
