import z from 'zod'
import { QrSessionStatus } from '@/constants/enum'
import i18n from '@/lib/i18n'

export const loginRequestSchema = z.object({
  email: z.string().email(i18n.t('auth:auth.validation.emailInvalid')),
  password: z.string().min(1, i18n.t('auth:auth.validation.passwordRequired')),
  deviceId: z.string().min(1, i18n.t('auth:auth.validation.deviceIdRequired')),
  deviceType: z.enum(['WEB', 'MOBILE'])
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export type TokenResponse = {
  accessToken: string
  refreshToken: string
  refreshTokenExpirationMs: number
}

export const registerRequestSchema = z
  .object({
    email: z.string().email(i18n.t('auth:auth.validation.emailInvalid')),
    password: z
      .string()
      .min(8, i18n.t('auth:auth.validation.passwordMin'))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        i18n.t('auth:auth.validation.passwordComplex')
      ),
    confirmPassword: z.string().min(1, i18n.t('auth:auth.validation.confirmPasswordRequired')),
    fullName: z.string().min(1, i18n.t('auth:auth.validation.fullNameRequired')),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, i18n.t('auth:auth.validation.phoneInvalid'))
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: i18n.t('auth:auth.validation.passwordMismatch'),
    path: ['confirmPassword']
  })

export type RegisterRequest = z.infer<typeof registerRequestSchema>

export type RegisterInitResponse = {
  message: string
  email: string
}

export const registerVerifyRequestSchema = z.object({
  email: z.string().email(i18n.t('auth:auth.validation.emailInvalid')),
  otp: z.string().regex(/^[0-9]{6}$/, i18n.t('auth:auth.validation.otpInvalid')),
  deviceId: z.string().min(1, i18n.t('auth:auth.validation.deviceIdRequired')),
  deviceType: z.enum(['WEB', 'MOBILE'])
})

export type RegisterVerifyRequest = z.infer<typeof registerVerifyRequestSchema>

export type AccountResponse = {
  id: string
  phoneNumber: string
  email: string
  createdAt: string
  lastModifiedAt: string
  createdBy: string
  lastModifiedBy: string
}

export const refreshRequestSchema = z.object({
  refreshToken: z.string().optional(),
  deviceId: z.string().min(1, i18n.t('auth:auth.validation.deviceIdRequired'))
})

export type RefreshRequest = z.infer<typeof refreshRequestSchema>

export type LogoutRequest = {
  refreshToken?: string
}

export const forgotPasswordRequestSchema = z.object({
  email: z.email()
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>

export type ForgotPasswordResponse = {
  message: string
  email: string
}

export const resetPasswordRequestSchema = z
  .object({
    email: z.string().email(i18n.t('auth:auth.validation.emailInvalid')),
    otp: z.string().min(6, i18n.t('auth:auth.validation.resetOtpMin')),
    newPassword: z
      .string()
      .min(8, i18n.t('auth:auth.validation.passwordMin'))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        i18n.t('auth:auth.validation.passwordComplex')
      ),
    confirmPassword: z.string().min(1, i18n.t('auth:auth.validation.confirmPasswordReset'))
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: i18n.t('auth:auth.validation.passwordMismatch'),
    path: ['confirmPassword']
  })

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>

export type QrGenerationResponse = {
  qrId: string
  qrContent: string
  expiresAt: string
}

export type QrStatusResponse = {
  status: QrSessionStatus
  userAvatar?: string
  userFullName?: string
  accessToken?: string
  refreshToken?: string
  refreshTokenExpirationMs?: number
}
