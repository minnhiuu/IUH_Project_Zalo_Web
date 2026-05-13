import { useQuery } from '@tanstack/react-query'
import {
  getBlockDetailsQueryOptions,
  getMyBlockedUsersQueryOptions,
  getMyProfileQueryOptions,
  getUserByIdQueryOptions,
  getUsersByIdsQueryOptions
} from './options'

export const useMyProfile = () => {
  return useQuery(getMyProfileQueryOptions())
}

export const useUserById = (id: string) => {
  return useQuery(getUserByIdQueryOptions(id))
}

export const useUsersByIds = (ids: string[]) => {
  return useQuery(getUsersByIdsQueryOptions(ids))
}

export const useBlockDetails = (userId: string) => {
  return useQuery(getBlockDetailsQueryOptions(userId))
}

export const useMyBlockedUsers = () => {
  return useQuery(getMyBlockedUsersQueryOptions())
}
