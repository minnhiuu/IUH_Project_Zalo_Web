import { useMutation } from '@tanstack/react-query'
import type { LoginRequest, LogoutRequest } from '../schemas/auth.schema'
import { authApi } from '@/features/auth/api/auth.api'

export const useLoginMutation = () =>
  useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (body: LoginRequest) => authApi.login(body)
  })

export const useLogoutMutation = () =>
  useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: (body?: LogoutRequest) => authApi.logout(body)
  })
