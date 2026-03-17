import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUserApi } from '../api/admin-user.api'
import { adminUserKeys } from './admin-keys'
import { handleErrorApi } from '@/utils/error-handler'
import type { BanUserRequest } from '../schemas/admin-user.schema'

export const useBanUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: BanUserRequest }) => adminUserApi.banUser(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) })
    },
    onError: (error) => handleErrorApi({ error })
  })
}

export const useUnbanUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => adminUserApi.unbanUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) })
    },
    onError: (error) => handleErrorApi({ error })
  })
}
