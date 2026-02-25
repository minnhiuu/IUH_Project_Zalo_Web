import type { TFunction } from 'i18next'
import { SEARCH_KEYS } from './search.keys'

export const createSearchTexts = (t: TFunction<'search'>) => ({
  placeholder: t(SEARCH_KEYS.placeholder),
  close: t(SEARCH_KEYS.close),
  recentHeader: t(SEARCH_KEYS.recentHeader),
  noRecent: t(SEARCH_KEYS.noRecent),
  searchResult: (query: string) => t(SEARCH_KEYS.searchResult, { query }),
  noResult: t(SEARCH_KEYS.noResult),
  noResultDescription: t(SEARCH_KEYS.noResultDescription),
  recent: t(SEARCH_KEYS.recent),
  clearAll: t(SEARCH_KEYS.clearAll),
  clearHistory: {
    title: t(SEARCH_KEYS.clearHistory.title),
    confirmMessage: t(SEARCH_KEYS.clearHistory.confirmMessage),
    cancel: t(SEARCH_KEYS.clearHistory.cancel),
    confirm: t(SEARCH_KEYS.clearHistory.confirm)
  }
})
