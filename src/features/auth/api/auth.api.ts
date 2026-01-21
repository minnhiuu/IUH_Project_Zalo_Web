import type { LoginRequest, TokenResponse } from '@/features/auth/schemas/auth.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/types/api'

export const authApi = {
  login: (request: LoginRequest) => http.post<ApiResponse<TokenResponse>>('/auth/login', request)
}
