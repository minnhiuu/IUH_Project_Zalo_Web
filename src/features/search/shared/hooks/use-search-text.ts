import { useTranslation } from 'react-i18next'
import { SEARCH_KEYS } from '../../i18n/search.keys'
import { createSearchTexts } from '../../i18n/search.texts'

export const useSearchText = () => {
  const { t, i18n } = useTranslation('globalSearch')

  return {
    t,
    i18n,
    keys: SEARCH_KEYS,
    text: createSearchTexts(t)
  }
}
