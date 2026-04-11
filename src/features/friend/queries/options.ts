import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { friendKeys } from './keys'
import { friendApi } from '../api/friend.api'
import { QUERY_POLICIES } from '@/constants/query-policies'
import type { FriendSuggestionResponse } from '../schemas/friend.schema'

const dedupeSuggestions = (items: FriendSuggestionResponse[]) => {
  const map = new Map<string, FriendSuggestionResponse>()
  items.forEach((item) => {
    if (!map.has(item.userId)) {
      map.set(item.userId, item)
    }
  })
  return Array.from(map.values())
}

const fetchSuggestionsWithFallback = async (page: number, size: number): Promise<FriendSuggestionResponse[]> => {
  try {
    const unifiedResponse = await friendApi.getUnifiedSuggestions(page, size)
    const unifiedData = unifiedResponse.data.data
    if (Array.isArray(unifiedData)) return unifiedData
    return unifiedData?.data || []
  } catch {
    // Fallback to graph + contacts when unified endpoint is temporarily unavailable.
    const [graphResult, contactResult] = await Promise.allSettled([
      friendApi.getGraphSuggestions(page, size),
      friendApi.getContactSuggestions(page, size)
    ])

    const graphItems =
      graphResult.status === 'fulfilled'
        ? Array.isArray(graphResult.value.data.data)
          ? graphResult.value.data.data
          : graphResult.value.data.data?.data || []
        : []

    const contactItems =
      contactResult.status === 'fulfilled'
        ? Array.isArray(contactResult.value.data.data)
          ? contactResult.value.data.data
          : contactResult.value.data.data?.data || []
        : []

    return dedupeSuggestions([...graphItems, ...contactItems])
  }
}

export const friendOptions = {
  receivedRequests: (page: number = 0, size: number = 10, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: friendKeys.receivedRequests(page, size),
      queryFn: async () => {
        const response = await friendApi.getReceivedFriendRequests(page, size)
        const pageResponse = response.data.data
        return Array.isArray(pageResponse) ? pageResponse : pageResponse?.data || []
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
        return Array.isArray(pageResponse) ? pageResponse : pageResponse?.data || []
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
        if (Array.isArray(pageResponse)) return pageResponse
        return pageResponse?.data || []
      },
      enabled
    }),

  myFriendsInfinite: (size: number = 20, enabled: boolean = true) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: friendKeys.myFriendsInfinite(size),
      queryFn: async ({ pageParam = 0 }) => {
        const response = await friendApi.getMyFriends(pageParam as number, size)
        return response.data.data
      },
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      initialPageParam: 0,
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
        return res?.mutualFriends || []
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
    }),

  unifiedSuggestions: (page: number = 0, size: number = 20, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: friendKeys.unifiedSuggestions(page, size),
      queryFn: async () => fetchSuggestionsWithFallback(page, size),
      enabled
    }),

  unifiedSuggestionsInfinite: (size: number = 20, enabled: boolean = true) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: friendKeys.unifiedSuggestionsInfinite(size),
      queryFn: async ({ pageParam = 0 }) => {
        const data = await fetchSuggestionsWithFallback(pageParam as number, size)
        return {
          data,
          page: pageParam as number,
          totalPages: data.length < size ? (pageParam as number) + 1 : (pageParam as number) + 2
        }
      },
      getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
      initialPageParam: 0,
      enabled
    })
}
