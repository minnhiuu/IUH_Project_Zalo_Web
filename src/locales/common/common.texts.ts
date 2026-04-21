import type { TFunction } from 'i18next'
import { COMMON_KEYS } from './common.keys'

export const createCommonTexts = (t: TFunction<'common'>) => ({
  nav: {
    messages: t(COMMON_KEYS.nav.messages),
    socialFeed: t(COMMON_KEYS.nav.socialFeed),
    search: t(COMMON_KEYS.nav.search),
    contacts: t(COMMON_KEYS.nav.contacts),
    todo: t(COMMON_KEYS.nav.todo),
    notifications: t(COMMON_KEYS.nav.notifications),
    cloud: t(COMMON_KEYS.nav.cloud),
    business: t(COMMON_KEYS.nav.business),
    settings: t(COMMON_KEYS.nav.settings)
  },
  ok: t(COMMON_KEYS.ok),
  cancel: t(COMMON_KEYS.cancel),
  loading: t(COMMON_KEYS.loading),
  pleaseWait: t(COMMON_KEYS.pleaseWait),
  error: {
    toastTitle: t(COMMON_KEYS.error_toast_title),
    default: t(COMMON_KEYS.errorDefault),
    contactAdmin: t(COMMON_KEYS.errorContactAdmin)
  }
})
