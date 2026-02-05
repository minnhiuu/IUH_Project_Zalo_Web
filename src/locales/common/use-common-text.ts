import { useTranslation } from 'react-i18next'
import { COMMON_KEYS } from './common.keys'
import { createCommonTexts } from './common.texts'

export const useCommonText = () => {
  const { t } = useTranslation('common')

  return {
    t,
    keys: COMMON_KEYS,
    text: createCommonTexts(t)
  }
}
