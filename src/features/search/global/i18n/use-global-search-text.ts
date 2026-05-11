import { useTranslation } from 'react-i18next'
import { GLOBAL_SEARCH_KEYS } from './global-search.keys'
import { createGlobalSearchTexts } from './global-search.texts'

export const useGlobalSearchText = () => {
  const { t, i18n } = useTranslation('globalSearch')

  return {
    t,
    i18n,
    keys: GLOBAL_SEARCH_KEYS,
    text: createGlobalSearchTexts(t)
  }
}
