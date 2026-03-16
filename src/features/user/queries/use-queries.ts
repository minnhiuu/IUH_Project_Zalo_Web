import { useQuery } from '@tanstack/react-query'
import { getMyProfileQueryOptions, getUserByIdQueryOptions } from './options'

export const useMyProfile = () => {
  return useQuery(getMyProfileQueryOptions())
}

export const useUserById = (id: string) => {
  return useQuery(getUserByIdQueryOptions(id))
}
