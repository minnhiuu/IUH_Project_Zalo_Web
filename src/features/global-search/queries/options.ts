import { queryOptions } from '@tanstack/react-query'
import { globalSearchApi, type GlobalSearchRequest } from '../api/global-search.api'
import { globalSearchKeys } from './keys'
import { QUERY_POLICIES } from '@/constants/query-policies'

export const globalSearchOptions = {
  overview: (request: GlobalSearchRequest, sectionSize = 5) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.overview(request),
      queryFn: () => globalSearchApi.getOverview(request, sectionSize),
      enabled: !!request.keyword && request.keyword.length > 0
    }),

  contacts: (keyword: string, page = 0, size = 20) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.contacts(keyword),
      queryFn: () => globalSearchApi.searchContacts(keyword, page, size),
      enabled: !!keyword && keyword.length > 0
    })
}
