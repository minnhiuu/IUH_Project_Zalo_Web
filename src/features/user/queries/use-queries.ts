import { useQuery } from '@tanstack/react-query'
import { getMyProfileQueryOptions } from './options'

export const useMyProfile = () => {
  return useQuery(getMyProfileQueryOptions())
}
