import { useTranslation } from 'react-i18next'
import { ADMIN_KEYS } from './admin.keys'
import { createAdminTexts } from './admin.texts'

export const useAdminText = () => {
  const { t } = useTranslation('admin')

  return {
    t,
    keys: ADMIN_KEYS,
    text: createAdminTexts(t)
  }
}
