import { QUERY_POLICIES } from '@/constants'
import { userApi } from '../api/user.api'
import { blockApi } from '../api/block.api'
import { userKeys, blockKeys } from './keys'
import { queryOptions } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/axios-client'

export const getMyProfileQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getMyProfile()
      return response.data.data ?? null
    },
    enabled: !!getAccessToken(),
    ...QUERY_POLICIES.DETAIL
  })

export const getUserByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await userApi.getUserById(id)
      return response.data.data ?? null
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })

export const getBlockDetailsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: blockKeys.detail(userId),
    queryFn: async () => {
      try {
        const response = await blockApi.getBlockDetails(userId)
        return response.data.data ?? null
      } catch (error) {
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
