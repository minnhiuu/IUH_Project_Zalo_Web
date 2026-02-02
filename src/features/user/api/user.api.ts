import type { UserResponse, UserUpdateRequest } from '@/features/user/schemas/user.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/types/api'

export const userApi = {
  getMyProfile: () => http.get<ApiResponse<UserResponse>>('/users/me'),
  updateMyProfile: (body: UserUpdateRequest) => http.put<ApiResponse<UserResponse>>('/users/me', body),
  updateAvatar: (body: FormData) => http.patch<ApiResponse<string>>('/users/profile/avatar', body),
  updateBackground: (body: FormData) => http.patch<ApiResponse<string>>('/users/profile/background', body)
}
