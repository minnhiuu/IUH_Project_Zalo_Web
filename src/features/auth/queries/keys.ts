import type { ForgotPasswordRequest, ResetPasswordRequest } from '@/features/auth/schemas/auth.schema'

export const authKeys = {
  all: () => ['auth'] as const,

  forgotPassword: (body?: ForgotPasswordRequest) =>
    body
      ? ([...authKeys.all(), 'forgot-password', body.email] as const)
      : ([...authKeys.all(), 'forgot-password'] as const),

  resetPassword: (body?: ResetPasswordRequest) =>
    body
      ? ([...authKeys.all(), 'reset-password', body.email, body.otp, body.newPassword] as const)
      : ([...authKeys.all(), 'reset-password'] as const),

  refresh: (refreshToken: string) => [...authKeys.all(), 'refresh', refreshToken] as const,

  login: () => [...authKeys.all(), 'login'] as const,

  initiateRegistration: () => [...authKeys.all(), 'initiateRegistration'] as const,

  verifyRegistration: () => [...authKeys.all(), 'verifyRegistration'] as const,

  logout: () => [...authKeys.all(), 'logout'] as const,

  generateQr: () => [...authKeys.all(), 'generate-qr'] as const,

  checkQrStatus: (qrId: string) => [...authKeys.all(), 'check-qr-status', qrId] as const
}
