import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api/user.api'
import { authApi } from '@/features/auth/api/auth.api'
import { blockApi } from '../api/block.api'
import { userKeys, blockKeys } from './keys'
import { useAuthContext } from '@/features/auth/context/auth-context'
import type { ApiResponse } from '@/shared/api'
import type { UserResponse } from '@/features/user/schemas/user.schema'
import type { ChangePasswordRequest } from '@/features/auth/schemas/auth.schema'
import type { BlockUserRequest } from '@/features/user/schemas/block.schema'

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
    mutationFn: (data: FormData | { imageKey: string }) => userApi.updateAvatar(data),
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
    mutationFn: (data: FormData | { imageKey: string; y: number }) => userApi.updateBackground(data),
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

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => authApi.changePassword(request)
  })
}

export const useBlockUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BlockUserRequest) => blockApi.blockUser(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.blockedUserId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
    }
  })
}

export const useUnblockUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blockedUserId: string) => blockApi.unblockUser(blockedUserId),
    onSuccess: (_, blockedUserId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(blockedUserId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(blockedUserId) })
    }
  })
}
