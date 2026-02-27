import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'

export const useRegisterDeviceMutation = () =>
  useMutation({
    mutationFn: notificationApi.registerDevice
  })

export const useUnregisterDeviceMutation = () =>
  useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      notificationApi.unregisterDevice(userId, token)
  })

export const useCreateFriendRequestNotificationMutation = () =>
  useMutation({
    mutationFn: notificationApi.createFriendRequest
  })

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}
