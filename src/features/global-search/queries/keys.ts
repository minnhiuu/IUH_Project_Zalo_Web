import type { GlobalSearchRequest } from '../api/global-search.api'

export const globalSearchKeys = {
  all: ['global-search'] as const,
  overview: (request: GlobalSearchRequest) => [...globalSearchKeys.all, 'overview', request] as const,
  contacts: (keyword: string, isGroup?: boolean, size?: number) => [...globalSearchKeys.all, 'contacts', keyword, { isGroup, size }] as const,
  people: (keyword: string) => [...globalSearchKeys.all, 'people', keyword] as const,
  groups: (keyword: string) => [...globalSearchKeys.all, 'groups', keyword] as const,
  messages: (request: GlobalSearchRequest, size?: number) => [...globalSearchKeys.all, 'messages', request, size] as const,
  files: (request: GlobalSearchRequest, size?: number) => [...globalSearchKeys.all, 'files', request, size] as const,
  senders: (keyword: string) => [...globalSearchKeys.all, 'senders', keyword] as const
}
