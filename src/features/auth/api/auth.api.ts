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
  QrStatusResponse
} from '@/features/auth/schemas/auth.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/types/api'

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

  logout: (request: LogoutRequest) => http.post<ApiResponse<void>>('/auth/logout', request),

  generateQr: () => http.post<ApiResponse<QrGenerationResponse>>('/auth/qr/generate'),

  checkQrStatus: (qrId: string) => http.get<ApiResponse<QrStatusResponse>>(`/auth/qr/check/${qrId}`)
}
