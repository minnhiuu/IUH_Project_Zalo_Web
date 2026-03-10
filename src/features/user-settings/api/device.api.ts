import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type { DeviceResponse, DeviceListResponse } from '@/features/user-settings/types/device.types'

export const deviceApi = {
  // Get all devices for the authenticated user
  getMyDevices: () => http.get<ApiResponse<DeviceListResponse>>('/auth/devices/sessions'),

  // Delete a specific device by id
  deleteDevice: (id: string) => http.delete<ApiResponse<void>>(`/auth/devices/${id}`)
}
