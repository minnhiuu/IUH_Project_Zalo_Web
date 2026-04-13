import { useQuery } from '@tanstack/react-query'
import { friendOptions } from './options'

export const useReceivedFriendRequests = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery(friendOptions.receivedRequests(page, size, enabled))
}

export const useSentFriendRequests = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery(friendOptions.sentRequests(page, size, enabled))
}

export const useMyFriends = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery(friendOptions.myFriends(page, size, enabled))
}

export const useFriendshipStatus = (userId: string, enabled: boolean = true) => {
  return useQuery(friendOptions.friendshipStatus(userId, enabled))
}

export const useMutualFriends = (userId: string, enabled: boolean = true) => {
  return useQuery(friendOptions.mutualFriends(userId, enabled))
}

export const useMutualFriendsCount = (userId: string, enabled: boolean = true) => {
  return useQuery(friendOptions.mutualFriendsCount(userId, enabled))
}
