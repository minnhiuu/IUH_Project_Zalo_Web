import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { globalSearchApi, type GlobalSearchRequest } from '../api/global-search.api'
import { globalSearchKeys } from './keys'
import { QUERY_POLICIES } from '@/constants/query-policies'

export const globalSearchOptions = {
  overview: (request: GlobalSearchRequest, sectionSize = 5) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.overview(request),
      queryFn: () => globalSearchApi.getOverview(request, sectionSize)
    }),

  contacts: (keyword: string, page = 0, size = 20) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.contacts(keyword),
      queryFn: () => globalSearchApi.searchContacts(keyword, page, size)
    }),

  contactsCategorized: (keyword: string, size = 1) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.contactsCategorized(keyword),
      queryFn: ({ pageParam }) => globalSearchApi.searchContactsCategorized(keyword, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const hasMorePeople = lastPage.people.page < lastPage.people.totalPages - 1
        const hasMoreGroups = lastPage.groups.page < lastPage.groups.totalPages - 1
        return (hasMorePeople || hasMoreGroups) ? lastPage.people.page + 1 : undefined
      }
    }),

  messages: (keyword: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.messages(keyword),
      queryFn: ({ pageParam }) => globalSearchApi.searchMessages(keyword, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined)
    }),

  files: (keyword: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.files(keyword),
      queryFn: ({ pageParam }) => globalSearchApi.searchFiles(keyword, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined)
    })
}
