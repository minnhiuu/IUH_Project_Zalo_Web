import { useTranslation } from 'react-i18next'
import { USER_KEYS } from './user.keys'
import { createUserTexts } from './user.texts'

export const useUserText = () => {
  const { t } = useTranslation('user')

  return {
    t,
    keys: USER_KEYS,
    text: createUserTexts(t)
  }
}
