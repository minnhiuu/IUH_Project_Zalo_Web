import { useMutation } from '@tanstack/react-query'
import type { ForgotPasswordRequest, LoginRequest, LogoutRequest, RegisterRequest, RegisterVerifyRequest, ResetPasswordRequest } from '../schemas/auth.schema'
import { authApi } from '../api/auth.api'
import { authKeys } from './keys'

export const useLoginMutation = () =>
  useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (body: LoginRequest) => authApi.login(body)
  })

export const useInitiateRegistration = () =>
  useMutation({
    mutationKey: authKeys.initiateRegistration(),
    mutationFn: (body: RegisterRequest) => authApi.initiateRegistration(body)
  })

export const useVerifyRegistration = () =>
  useMutation({
    mutationKey: authKeys.verifyRegistration(),
    mutationFn: (body: RegisterVerifyRequest) => authApi.verifyRegistration(body)
  })

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (body: ForgotPasswordRequest) => authApi.forgotPassword(body)
  })

export const useResetPasswordMutation = () =>
  useMutation({
    mutationKey: authKeys.resetPassword(),
    mutationFn: (body: ResetPasswordRequest) => authApi.resetPassword(body)
  })

export const useLogoutMutation = () =>
  useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: (body?: LogoutRequest) => authApi.logout(body)
  })
