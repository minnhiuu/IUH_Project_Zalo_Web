import { useTranslation } from 'react-i18next'
import { SOCIAL_KEYS } from './social.keys'
import { createSocialTexts } from './social.texts'

export const useSocialText = () => {
  const { t, i18n } = useTranslation('social')

  return {
    t,
    keys: SOCIAL_KEYS,
    text: createSocialTexts(t),
    language: i18n.resolvedLanguage || i18n.language || 'en'
  }
}
