import http from '@/lib/axios-client'
import type { ApiResponse } from '@/types/api'
import type { DeviceResponse } from '@/features/user/types/device.types'

export const deviceApi = {
  // Get all devices for the authenticated user
  getMyDevices: () => http.get<ApiResponse<DeviceResponse[]>>('/auth/devices/active-sessions'),

  // Delete a specific device by id
  deleteDevice: (id: string) => http.delete<ApiResponse<void>>(`/auth/devices/${id}`)
}
