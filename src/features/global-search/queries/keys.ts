import type { GlobalSearchRequest } from '../api/global-search.api'

export const globalSearchKeys = {
  all: ['global-search'] as const,
  overview: (request: GlobalSearchRequest) => [...globalSearchKeys.all, 'overview', request] as const,
  contacts: (keyword: string) => [...globalSearchKeys.all, 'contacts', keyword] as const
}
