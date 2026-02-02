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
    mutationFn: (formData: FormData) => userApi.updateAvatar(formData),
    onSuccess: (response) => {
      const { url } = response.data.data

      queryClient.setQueryData<ApiResponse<UserResponse>>(userKeys.profile(), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            avatar: url
          }
        }
      })

      if (user) {
        updateUser({
          ...user,
          avatar: `${url}?t=${Date.now()}`
        })
      }

      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    }
  })
}

export const useUpdateBackgroundMutation = () => {
  const queryClient = useQueryClient()
  const { updateUser, user } = useAuthContext()

  return useMutation({
    mutationFn: (formData: FormData) => userApi.updateBackground(formData),
    onSuccess: (response) => {
      const { url, y } = response.data.data

      queryClient.setQueryData<ApiResponse<UserResponse>>(userKeys.profile(), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            background: url,
            backgroundY: y
          }
        }
      })

      if (user) {
        updateUser({
          ...user,
          background: `${url}?t=${Date.now()}`,
          backgroundY: y
        })
      }

      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    }
  })
}

export const useUpdateBackgroundPositionMutation = () => {
  const queryClient = useQueryClient()
  const { updateUser, user } = useAuthContext()

  return useMutation({
    mutationFn: (y: number) => userApi.updateBackgroundPosition(y),
    onSuccess: (response) => {
      const { y } = response.data.data

      queryClient.setQueryData<ApiResponse<UserResponse>>(userKeys.profile(), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            backgroundY: y
          }
        }
      })

      if (user) {
        updateUser({
          ...user,
          backgroundY: y
        })
      }

      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    }
  })
}
