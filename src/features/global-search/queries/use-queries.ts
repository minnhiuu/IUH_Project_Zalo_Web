import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { globalSearchOptions } from './options'
import type { GlobalSearchRequest } from '../api/global-search.api'

export const useGlobalSearchOverview = (request: GlobalSearchRequest, sectionSize = 5, enabled = true) => {
  return useQuery({
    ...globalSearchOptions.overview(request, sectionSize),
    enabled: enabled && !!request.keyword && request.keyword.length > 0
  })
}

export const useGlobalSearchContacts = (keyword: string, enabled = true) => {
  return useQuery({
    ...globalSearchOptions.contacts(keyword),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}

export const useInfiniteGlobalSearchContactsCategorized = (keyword: string, size = 1, enabled = true) => {
  return useInfiniteQuery({
    ...globalSearchOptions.contactsCategorized(keyword, size),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}

export const useInfiniteGlobalSearchMessages = (keyword: string, size = 20, enabled = true) => {
  return useInfiniteQuery({
    ...globalSearchOptions.messages(keyword, size),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}

export const useInfiniteGlobalSearchFiles = (keyword: string, size = 20, enabled = true) => {
  return useInfiniteQuery({
    ...globalSearchOptions.files(keyword, size),
    enabled: enabled && !!keyword && keyword.length > 0
  })
}
