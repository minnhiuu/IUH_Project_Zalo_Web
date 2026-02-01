import type { UserResponse, UserUpdateRequest } from '@/features/user/schemas/user.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/types/api'

export const userApi = {
  getMyProfile: () => http.get<ApiResponse<UserResponse>>('/users/me'),
  updateMyProfile: (body: UserUpdateRequest) => http.put<ApiResponse<UserResponse>>('/users/me', body)
}
