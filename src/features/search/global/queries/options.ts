import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { globalSearchApi, type GlobalSearchRequest } from '../api/global-search.api'
import { globalSearchKeys } from './keys'
import { QUERY_POLICIES } from '@/constants/query-policies'

export const globalSearchOptions = {
  contacts: (keyword: string, page = 0, size = 20, isGroup?: boolean) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.contacts(keyword, isGroup, size),
      queryFn: () => globalSearchApi.searchContacts(keyword, page, size, isGroup)
    }),

  senders: (keyword: string) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.senders(keyword),
      queryFn: () => globalSearchApi.searchSenders(keyword)
    }),

  messages: (request: GlobalSearchRequest, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.messages(request, size),
      queryFn: ({ pageParam }) => globalSearchApi.searchMessages(request, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined)
    }),

  people: (keyword: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.people(keyword),
      queryFn: ({ pageParam }) => globalSearchApi.searchContacts(keyword, pageParam as number, size, false),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined
      }
    }),

  groups: (keyword: string, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.groups(keyword),
      queryFn: ({ pageParam }) => globalSearchApi.searchContacts(keyword, pageParam as number, size, true),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined)
    }),

  files: (request: GlobalSearchRequest, size = 20) =>
    infiniteQueryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: globalSearchKeys.files(request, size),
      queryFn: ({ pageParam }) => globalSearchApi.searchFiles(request, pageParam as number, size),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined)
    })
}
