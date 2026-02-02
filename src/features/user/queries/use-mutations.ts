import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api/user.api'
import { userKeys } from './keys'
import { useAuthContext } from '@/features/auth/context/auth-context'
import type { ApiResponse } from '@/types/api'
import type { UserResponse } from '@/features/user/schemas/user.schema'

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthContext()

  return useMutation({
    mutationFn: userApi.updateMyProfile,
    onSuccess: (response) => {
      const updatedUser = response.data.data
      if (updatedUser) {
        updateUser(updatedUser)
      }
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    }
  })
}

export const useUpdateAvatarMutation = () => {
  const queryClient = useQueryClient()
  const { updateUser, user } = useAuthContext()

  return useMutation({
    mutationFn: userApi.updateAvatar,
    onSuccess: (response) => {
      const avatarUrl = response.data.data
      if (avatarUrl) {
        queryClient.setQueryData<ApiResponse<UserResponse>>(userKeys.profile(), (old) => {
          if (!old?.data) return old
          return {
            ...old,
            data: { ...old.data, avatar: avatarUrl }
          }
        })

        if (user) {
          updateUser({ ...user, avatar: `${avatarUrl}?t=${Date.now()}` })
        }
      }
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    }
  })
}

export const useUpdateBackgroundMutation = () => {
  const queryClient = useQueryClient()
  const { updateUser, user } = useAuthContext()

  return useMutation({
    mutationFn: userApi.updateBackground,
    onSuccess: (response) => {
      const backgroundUrl = response.data.data
      if (backgroundUrl) {
        queryClient.setQueryData<ApiResponse<UserResponse>>(userKeys.profile(), (old) => {
          if (!old?.data) return old
          return {
            ...old,
            data: { ...old.data, background: backgroundUrl }
          }
        })

        if (user) {
          updateUser({ ...user, background: `${backgroundUrl}?t=${Date.now()}` })
        }
      }
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    }
  })
}
