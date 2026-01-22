import { QUERY_POLICIES } from '@/constants'
import { userApi } from '../api/user.api'
import { userKeys } from './keys'
import { queryOptions } from '@tanstack/react-query'

export const getMyProfileQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getMyProfile()
      return response.data
    },
    ...QUERY_POLICIES.DETAIL
  })
