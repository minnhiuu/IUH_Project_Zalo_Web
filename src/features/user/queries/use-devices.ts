import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceApi } from '@/features/user/api/device.api'
import { authApi } from '@/features/auth/api/auth.api'
import type { DeviceResponse } from '@/features/user/types/device.types'

// Query keys
export const deviceKeys = {
  all: ['devices'] as const,
  myDevices: () => [...deviceKeys.all, 'my'] as const
}

// Hook to get all devices for the authenticated user
export const useMyDevices = () => {
  return useQuery({
    queryKey: deviceKeys.myDevices(),
    queryFn: async () => {
      const response = await deviceApi.getMyDevices()
      return response.data.data
    }
  })
}

// Hook to delete a device
export const useDeleteDevice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deviceId: string) => deviceApi.deleteDevice(deviceId),
    onSuccess: () => {
      // Invalidate and refetch devices list
      queryClient.invalidateQueries({ queryKey: deviceKeys.myDevices() })
    }
  })
}

// Hook to logout other devices
export const useLogoutOtherDevices = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logoutOthers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.myDevices() })
    }
  })
}
