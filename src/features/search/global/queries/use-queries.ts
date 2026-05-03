import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { globalSearchOptions } from './options'
import type { GlobalSearchRequest } from '../api/global-search.api'

export const useGlobalSearchContacts = (keyword: string, page = 0, size = 20, isGroup?: boolean, enabled = true) => {
  return useQuery({
    ...globalSearchOptions.contacts(keyword, page, size, isGroup),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}

export const useGlobalSearchSenders = (keyword: string, enabled = true) => {
  return useQuery({
    ...globalSearchOptions.senders(keyword),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}

export const useInfiniteGlobalSearchPeople = (keyword: string, size = 20, enabled = true) => {
  return useInfiniteQuery({
    ...globalSearchOptions.people(keyword, size),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}

export const useInfiniteGlobalSearchGroups = (keyword: string, size = 20, enabled = true) => {
  return useInfiniteQuery({
    ...globalSearchOptions.groups(keyword, size),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}

export const useInfiniteGlobalSearchMessages = (request: GlobalSearchRequest, size = 20, enabled = true) => {
  return useInfiniteQuery({
    ...globalSearchOptions.messages(request, size),
    enabled: enabled && !!request.keyword && request.keyword.length > 0
  })
}

export const useInfiniteGlobalSearchFiles = (request: GlobalSearchRequest, size = 20, enabled = true) => {
  return useInfiniteQuery({
    ...globalSearchOptions.files(request, size),
    enabled: enabled && !!request.keyword && request.keyword.length > 0
  })
}
