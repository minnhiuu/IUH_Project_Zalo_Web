import { QUERY_POLICIES } from '@/constants'
import { userApi } from '../api/user.api'
import { blockApi } from '../api/block.api'
import { userKeys, blockKeys } from './keys'
import { queryOptions } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/axios-client'
import { socialFeedApi } from '@/features/social-feed/api/post.api'

export const getMyProfileQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getMyProfile()
      const profile = response.data.data ?? null
      if (profile) {
        try {
          const storyResponse = await socialFeedApi.getUserStory('me')
          profile.story = storyResponse.data.data ?? null
        } catch (error) {
          console.error('Failed to fetch user story:', error)
          profile.story = null
        }
      }
      return profile
    },
    enabled: !!getAccessToken(),
    ...QUERY_POLICIES.DETAIL
  })

export const getUserByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await userApi.getUserById(id)
      const profile = response.data.data ?? null
      if (profile) {
        try {
          const storyResponse = await socialFeedApi.getUserStory(id)
          profile.story = storyResponse.data.data ?? null
        } catch (error) {
          console.error('Failed to fetch user story:', error)
          profile.story = null
        }
      }
      return profile
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })

export const getUsersByIdsQueryOptions = (ids: string[]) =>
  queryOptions({
    queryKey: userKeys.batch(ids),
    queryFn: async () => {
      const response = await userApi.getUsersByIds(ids)
      return response.data.data ?? {}
    },
    enabled: ids.length > 0,
    ...QUERY_POLICIES.DETAIL
  })

export const getBlockDetailsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: blockKeys.detail(userId),
    queryFn: async () => {
      try {
        const response = await blockApi.getBlockDetails(userId)
        return response.data.data ?? null
      } catch {
        return null
      }
    },
    enabled: !!userId,
    ...QUERY_POLICIES.DETAIL
  })

export const getMyBlockedUsersQueryOptions = () =>
  queryOptions({
    queryKey: blockKeys.myBlocks(),
    queryFn: async () => {
      const response = await blockApi.getMyBlockedUsersWithDetails()
      return response.data.data ?? []
    },
    enabled: !!getAccessToken(),
    ...QUERY_POLICIES.LIST
  })
