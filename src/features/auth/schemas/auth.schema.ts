import z from 'zod'

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  deviceId: z.string().min(1, 'Device ID không được để trống'),
  deviceType: z.enum(['WEB', 'MOBILE'])
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export type TokenResponse = {
  accessToken: string
  refreshToken: string
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
