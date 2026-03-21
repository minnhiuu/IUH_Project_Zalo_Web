import { z } from 'zod'

export const FriendStatus = {
  Accepted: 'ACCEPTED',
  Declined: 'DECLINED',
  Pending: 'PENDING',
  Cancelled: 'CANCELLED'
} as const

export type FriendStatus = (typeof FriendStatus)[keyof typeof FriendStatus]

export const friendRequestSendRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  message: z.string().optional()
})

export type FriendRequestSendRequest = z.infer<typeof friendRequestSendRequestSchema>

export const friendRequestActionRequestSchema = z.object({
  friendshipId: z.string().min(1, 'Friendship ID is required')
})

export type FriendRequestActionRequest = z.infer<typeof friendRequestActionRequestSchema>

export type UserSummaryResponse = {
  id: string
  accountId: string
  userName: string
  email: string
  phone: string
  avatar: string
}

export type FriendRequestResponse = {
  id: string
  requestedUserId: string
  requestedUserName: string
  requestedUserAvatar: string
  receivedUserId: string
  receivedUserName: string
  receivedUserAvatar: string
  message: string | null
  status: FriendStatus
  createdAt: string
  updatedAt: string
}

export type FriendResponse = {
  userId: string
  userName: string
  userAvatar: string
  userEmail: string
  userPhone: string
  friendsSince: string
  mutualFriendsCount: number
}

export type FriendshipStatusResponse = {
  areFriends: boolean
  status: FriendStatus | null
  friendshipId: string | null
  requestedBy: string | null
}

export type MutualFriendsResponse = {
  count: number
  mutualFriends: FriendResponse[]
}
