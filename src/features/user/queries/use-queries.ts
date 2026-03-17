import { useQuery } from '@tanstack/react-query'
import {
  getBlockDetailsQueryOptions,
  getMyBlockedUsersQueryOptions,
  getMyProfileQueryOptions,
  getUserByIdQueryOptions
} from './options'

export const useMyProfile = () => {
  return useQuery(getMyProfileQueryOptions())
}

export const useUserById = (id: string) => {
  return useQuery(getUserByIdQueryOptions(id))
}

export const useBlockDetails = (userId: string) => {
  return useQuery(getBlockDetailsQueryOptions(userId))
}

export const useMyBlockedUsers = () => {
  return useQuery(getMyBlockedUsersQueryOptions())
}
