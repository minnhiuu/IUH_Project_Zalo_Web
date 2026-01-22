import { useMutation } from '@tanstack/react-query'
import type { LoginRequest, LogoutRequest } from '../schemas/auth.schema'
import { authApi } from '../api/auth.api'
import { authKeys } from './keys'

export const useLoginMutation = () =>
  useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (body: LoginRequest) => authApi.login(body)
  })

export const useLogoutMutation = () =>
  useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: (body?: LogoutRequest) => authApi.logout(body)
  })
