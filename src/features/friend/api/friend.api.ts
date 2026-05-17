import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  FriendRequestSendRequest,
  FriendRequestResponse,
  FriendResponse,
  FriendSuggestionResponse,
  FriendshipStatusResponse,
  MutualFriendsResponse
} from '../schemas/friend.schema'

export const friendApi = {
  sendFriendRequest: (request: FriendRequestSendRequest) =>
    http.post<ApiResponse<FriendRequestResponse>>('/friendships/requests', request),

  acceptFriendRequest: (friendshipId: string) =>
    http.put<ApiResponse<FriendRequestResponse>>(`/friendships/requests/${friendshipId}/accept`),

  declineFriendRequest: (friendshipId: string) =>
    http.put<ApiResponse<void>>(`/friendships/requests/${friendshipId}/decline`),

  cancelFriendRequest: (friendshipId: string) =>
    http.put<ApiResponse<void>>(`/friendships/requests/${friendshipId}/cancel`),

  getReceivedFriendRequests: (page: number = 0, size: number = 10) =>
    http.get<ApiResponse<PageResponse<FriendRequestResponse>>>(
      `/friendships/requests/received?page=${page}&size=${size}`
    ),

  getSentFriendRequests: (page: number = 0, size: number = 10) =>
    http.get<ApiResponse<PageResponse<FriendRequestResponse>>>(`/friendships/requests/sent?page=${page}&size=${size}`),

  getMyFriends: (page: number = 0, size: number = 10) =>
    http.get<ApiResponse<PageResponse<FriendResponse>>>(`/friendships/friends?page=${page}&size=${size}`),

  getOnlineFriends: (page: number = 0, size: number = 20) =>
    http.get<ApiResponse<PageResponse<UserSummaryResponse>>>(`/friendships/online?page=${page}&size=${size}`),

  unfriend: (friendId: string) => http.delete<ApiResponse<void>>(`/friendships/friends/${friendId}`),

  checkFriendshipStatus: (userId: string) =>
    http.get<ApiResponse<FriendshipStatusResponse>>(`/friendships/status/${userId}`),

  getMutualFriends: (userId: string) => http.get<ApiResponse<MutualFriendsResponse>>(`/friendships/mutual/${userId}`),

  getMutualFriendsCount: (userId: string) => http.get<ApiResponse<number>>(`/friendships/mutual/${userId}/count`),

  batchCheckFriendshipStatus: (targetUserIds: string[]) =>
    http.post<ApiResponse<Record<string, string | null>>>('/friendships/batch-status', targetUserIds),

  getUnifiedSuggestions: (page: number = 0, size: number = 20) =>
    http.get<ApiResponse<PageResponse<FriendSuggestionResponse>>>(`/friendships/suggestions?page=${page}&size=${size}`),

  getGraphSuggestions: (page: number = 0, size: number = 20) =>
    http.get<ApiResponse<PageResponse<FriendSuggestionResponse>>>(
      `/friendships/suggestions/graph?page=${page}&size=${size}`
    ),

  getContactSuggestions: (page: number = 0, size: number = 20) =>
    http.get<ApiResponse<PageResponse<FriendSuggestionResponse>>>(
      `/friendships/suggestions/contacts?page=${page}&size=${size}`
    )
}
