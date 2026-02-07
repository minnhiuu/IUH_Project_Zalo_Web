import { QUERY_POLICIES } from '@/constants'
import { userApi } from '../api/user.api'
import { userKeys } from './keys'
import { queryOptions } from '@tanstack/react-query'

export const getMyProfileQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getMyProfile()
      return response.data.data
    },
    ...QUERY_POLICIES.DETAIL
  })

export const getUserByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await userApi.getUserById(id)
      return response.data.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })
