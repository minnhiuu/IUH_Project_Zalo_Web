import z from 'zod'

export const loginRequestSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  deviceId: z.string().min(1, 'Device ID không được để trống'),
  deviceType: z.enum(['WEB', 'MOBILE'])
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export type TokenResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

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
