import type { TFunction } from 'i18next'
import { SEARCH_KEYS } from './search.keys'

export const createSearchTexts = (t: TFunction<'search'>) => ({
  placeholder: t(SEARCH_KEYS.placeholder),
  close: t(SEARCH_KEYS.close),
  recentHeader: t(SEARCH_KEYS.recentHeader),
  noRecent: t(SEARCH_KEYS.noRecent),
  searchResult: (query: string) => t(SEARCH_KEYS.searchResult, { query }),
  noResult: t(SEARCH_KEYS.noResult)
})
