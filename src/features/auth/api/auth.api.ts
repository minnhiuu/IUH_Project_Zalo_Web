import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  RegisterInitResponse,
  RegisterRequest,
  RegisterVerifyRequest,
  ResetPasswordRequest,
  TokenResponse,
  QrGenerationResponse,
  QrStatusResponse,
  ChangePasswordRequest,
  LogoutDeviceRequest
} from '@/features/auth/schemas/auth.schema'
import { QrSessionStatus } from '@/constants/enum'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const authApi = {
  login: (request: LoginRequest) => http.post<ApiResponse<TokenResponse>>('/auth/login', request),

  initiateRegistration: (request: RegisterRequest) =>
    http.post<ApiResponse<RegisterInitResponse>>('/auth/register', request),

  verifyRegistration: (request: RegisterVerifyRequest) =>
    http.post<ApiResponse<TokenResponse>>('/auth/register/verify', request),

  forgotPassword: (request: ForgotPasswordRequest) =>
    http.post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', request),

  resetPassword: (request: ResetPasswordRequest) =>
    http.post<ApiResponse<TokenResponse>>('/auth/reset-password', request),

  refresh: (request: RefreshRequest) => http.post<ApiResponse<TokenResponse>>('/auth/refresh', request),

  logout: (request?: LogoutRequest) => http.post<ApiResponse<void>>('/auth/logout', request),

  logoutOthers: () => http.post<ApiResponse<void>>('/auth/logout-others'),

  logoutDevice: (request: LogoutDeviceRequest) => http.post<ApiResponse<void>>('/auth/logout-device', request),

  changePassword: (request: ChangePasswordRequest) => http.post<ApiResponse<void>>('/auth/change-password', request),

  generateQr: () => http.post<ApiResponse<QrGenerationResponse>>('/auth/qr/generate'),

  waitQrStatus: (qrId: string, expectedStatus: QrSessionStatus, signal?: AbortSignal) =>
    http.get<ApiResponse<QrStatusResponse>>(`/auth/qr/wait/${qrId}`, {
      params: { expectedStatus },
      signal
    })
}
