import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { friendOptions } from './options'
import { friendKeys } from './keys'
import { friendApi } from '../api/friend.api'

export const useReceivedFriendRequests = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery(friendOptions.receivedRequests(page, size, enabled))
}

export const useSentFriendRequests = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery(friendOptions.sentRequests(page, size, enabled))
}

export const useMyFriends = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery(friendOptions.myFriends(page, size, enabled))
}

export const useMyFriendsInfinite = (size: number = 20, enabled: boolean = true) => {
  return useInfiniteQuery(friendOptions.myFriendsInfinite(size, enabled))
}

export const useFriendshipStatus = (userId: string, enabled: boolean = true) => {
  return useQuery(friendOptions.friendshipStatus(userId, enabled))
}

export const useBatchFriendshipStatus = (userIds: string[], enabled: boolean = true) => {
  return useQuery(friendOptions.batchFriendshipStatus(userIds, enabled))
}

export const useMutualFriends = (userId: string, enabled: boolean = true) => {
  return useQuery(friendOptions.mutualFriends(userId, enabled))
}

export const useMutualFriendsCount = (userId: string, enabled: boolean = true) => {
  return useQuery(friendOptions.mutualFriendsCount(userId, enabled))
}

export const useUnifiedSuggestions = (page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery(friendOptions.unifiedSuggestions(page, size, enabled))
}

export const useUnifiedSuggestionsInfinite = (size: number = 20, enabled: boolean = true) => {
  return useInfiniteQuery(friendOptions.unifiedSuggestionsInfinite(size, enabled))
}

export const useOnlineFriends = (page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.onlineFriends(page, size),
    queryFn: async () => {
      const res = await friendApi.getOnlineFriends(page, size)
      return res.data.data
    },
    enabled,
    staleTime: 30_000 // Presence data is relatively stable
  })
}
