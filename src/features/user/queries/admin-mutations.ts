import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUserApi } from '../api/admin-user.api'
import { adminUserKeys } from './admin-keys'
import type { BanUserRequest } from '../schemas/admin-user.schema'

export const useBanUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: BanUserRequest }) =>
      adminUserApi.banUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
    }
  })
}

export const useUnbanUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => adminUserApi.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
    }
  })
}
