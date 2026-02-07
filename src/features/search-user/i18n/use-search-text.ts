import { useTranslation } from 'react-i18next'
import { SEARCH_KEYS } from './search.keys'
import { createSearchTexts } from './search.texts'

export const useSearchText = () => {
  const { t } = useTranslation('search')

  return {
    t,
    keys: SEARCH_KEYS,
    text: createSearchTexts(t)
  }
}
