import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceApi } from '@/features/user-settings/api/device.api'
import { authApi } from '@/features/auth/api/auth.api'
import type { DeviceListResponse } from '@/features/user-settings/types/device.types'

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

// Hook to logout a specific device
export const useLogoutDevice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => authApi.logoutDevice({ sessionId }),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: deviceKeys.myDevices() })

      const previousDevices = queryClient.getQueryData<DeviceListResponse>(deviceKeys.myDevices())

      queryClient.setQueryData<DeviceListResponse>(deviceKeys.myDevices(), (old) => {
        if (!old) return old

        const fromCurrent = old.activeDevices.find((device) => device.sessionId === sessionId)
        const fromOther = old.otherDevices.find((device) => device.sessionId === sessionId)
        const targetDevice = fromCurrent ?? fromOther

        if (!targetDevice) return old

        const nextDevice = {
          ...targetDevice,
          isActive: false,
          isCurrentDevice: false
        }

        return {
          activeDevices: old.activeDevices.filter((device) => device.sessionId !== sessionId),
          otherDevices: [...old.otherDevices.filter((device) => device.sessionId !== sessionId), nextDevice]
        }
      })

      return { previousDevices }
    },
    onError: (_err, _sessionId, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(deviceKeys.myDevices(), context.previousDevices)
      }
    }
  })
}
