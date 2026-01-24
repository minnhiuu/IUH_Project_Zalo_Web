import z from 'zod'

export const loginRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  deviceId: z.string().min(1, 'Device ID không được để trống'),
  deviceType: z.enum(['WEB', 'MOBILE'])
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export type TokenResponse = {
  accessToken: string
  refreshToken: string
}

export const registerRequestSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt'),
    confirmPassword: z.string().min(1, 'Mật khẩu nhập lại không được để trống'),
    fullName: z.string().min(1, 'Họ và tên không được để trống'),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có đúng 10 chữ số')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type RegisterRequest = z.infer<typeof registerRequestSchema>

export type RegisterInitResponse = {
  message: string,
  email: string
}

export const registerVerifyRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otp: z.string().regex(/^[0-9]{6}$/, 'Mã OTP phải có 6 chữ số'),
  deviceId: z.string().min(1, 'Device ID không được để trống'),
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
  deviceId: z.string().min(1, 'Device ID không được để trống')
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
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().min(6, 'Mã xác thực phải có ít nhất 6 ký tự'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
