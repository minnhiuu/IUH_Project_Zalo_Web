import { useMutation } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'

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
