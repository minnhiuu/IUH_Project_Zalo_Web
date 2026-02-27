import { useTranslation } from 'react-i18next'

export const useNotificationText = () => {
  const { t } = useTranslation('notification')

  return {
    title: t('notification.title'),
    empty: {
      title: t('notification.empty.title'),
      description: t('notification.empty.description')
    }
  }
}
