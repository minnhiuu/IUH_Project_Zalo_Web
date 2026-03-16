import { useTranslation } from 'react-i18next'
import { AUTH_KEYS } from './auth.keys'
import { createAuthTexts } from './auth.texts'

export const useAuthText = () => {
  const { t } = useTranslation('auth')

  return {
    t,
    keys: AUTH_KEYS,
    text: createAuthTexts(t)
  }
}
