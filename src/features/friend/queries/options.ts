import { queryOptions } from '@tanstack/react-query'
import { friendKeys } from './keys'
import { friendApi } from '../api/friend.api'
import { QUERY_POLICIES } from '@/constants/query-policies'

export const friendOptions = {
  receivedRequests: (page: number = 0, size: number = 10, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: friendKeys.receivedRequests(page, size),
      queryFn: async () => {
        const response = await friendApi.getReceivedFriendRequests(page, size)
        const pageResponse = response.data.data
        return Array.isArray(pageResponse) ? pageResponse : (pageResponse?.data || [])
      },
      enabled
    }),

  sentRequests: (page: number = 0, size: number = 10, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: friendKeys.sentRequests(page, size),
      queryFn: async () => {
        const response = await friendApi.getSentFriendRequests(page, size)
        const pageResponse = response.data.data
        return Array.isArray(pageResponse) ? pageResponse : (pageResponse?.data || [])
      },
      enabled
    }),

  myFriends: (page: number = 0, size: number = 10, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: friendKeys.myFriends(page, size),
      queryFn: async () => {
        const response = await friendApi.getMyFriends(page, size)
        const pageResponse = response.data.data
        return Array.isArray(pageResponse) ? pageResponse : (pageResponse?.data || [])
      },
      enabled
    }),

  friendshipStatus: (userId: string, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: friendKeys.status(userId),
      queryFn: async () => {
        const response = await friendApi.checkFriendshipStatus(userId)
        return response.data.data
      },
      enabled: enabled && !!userId
    }),

  mutualFriends: (userId: string, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: friendKeys.mutual(userId),
      queryFn: async () => {
        const response = await friendApi.getMutualFriends(userId)
        const res = response.data.data
        if (Array.isArray(res)) return res
        return res?.data || res?.mutualFriends || []
      },
      enabled: enabled && !!userId
    }),

  mutualFriendsCount: (userId: string, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: friendKeys.mutualCount(userId),
      queryFn: async () => {
        const response = await friendApi.getMutualFriendsCount(userId)
        return response.data.data
      },
      enabled: enabled && !!userId
    })
}
