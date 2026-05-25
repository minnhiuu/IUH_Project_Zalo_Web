import { useTranslation } from 'react-i18next'

export const useNotificationText = () => {
  const { t } = useTranslation('notification')

  return {
    title: t('notification.title'),
    filter: {
      all: t('notification.filter.all'),
      unread: t('notification.filter.unread')
    },
    group: {
      newest: t('notification.group.newest'),
      today: t('notification.group.today'),
      previous: t('notification.group.previous')
    },
    empty: {
      title: t('notification.empty.title'),
      description: t('notification.empty.description'),
      placeholder: t('notification.empty.placeholder')
    },
    action: {
      accept: t('notification.action.accept'),
      decline: t('notification.action.decline'),
      accepted: t('notification.action.accepted'),
      declined: t('notification.action.declined'),
      viewProfile: t('notification.action.viewProfile'),
      followers: (count: number) => t('notification.action.followers', { count })
    },
    menu: {
      markAllAsRead: t('notification.menu.markAllAsRead'),
      settings: t('notification.menu.settings'),
      open: t('notification.menu.open')
    },
    dropdown: {
      trigger: t('notification.dropdown.trigger'),
      viewAll: t('notification.dropdown.viewAll'),
      unreadBadge: (count: number) => t('notification.dropdown.unreadBadge', { count })
    },
    list: {
      newUpdates: t('notification.list.newUpdates'),
      loading: t('notification.list.loading'),
      loadPrevious: t('notification.list.loadPrevious')
    },
    toast: {
      acceptSuccess: t('notification.toast.acceptSuccess'),
      acceptError: t('notification.toast.acceptError'),
      declineSuccess: t('notification.toast.declineSuccess'),
      declineError: t('notification.toast.declineError'),
      newNotification: t('notification.toast.newNotification')
    }
  }
}
