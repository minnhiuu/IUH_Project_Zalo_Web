import { useQuery } from '@tanstack/react-query'
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
