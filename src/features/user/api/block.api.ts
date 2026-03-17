import type {
  BlockUserRequest,
  UpdateBlockPreferenceRequest,
  BlockedUserResponse,
  BlockedUserDetailResponse
} from '@/features/user/schemas/block.schema'
import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export const blockApi = {
  blockUser: (body: BlockUserRequest) => http.post<ApiResponse<BlockedUserResponse>>('/blocks', body),

  unblockUser: (blockedUserId: string) => http.delete<ApiResponse<void>>(`/blocks/${blockedUserId}`),

  updateBlockPreference: (blockedUserId: string, body: UpdateBlockPreferenceRequest) =>
    http.patch<ApiResponse<BlockedUserResponse>>(`/blocks/${blockedUserId}/preferences`, body),

  getMyBlockedUsers: () => http.get<ApiResponse<BlockedUserResponse[]>>('/blocks'),

  getMyBlockedUsersWithDetails: () => http.get<ApiResponse<BlockedUserDetailResponse[]>>('/blocks/details'),

  isUserBlocked: (userId: string) => http.get<ApiResponse<boolean>>(`/blocks/${userId}/check`),

  getBlockDetails: (blockedUserId: string) => http.get<ApiResponse<BlockedUserResponse>>(`/blocks/${blockedUserId}`)
}
