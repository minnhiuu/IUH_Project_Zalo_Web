import { ADMIN_KEYS } from './keys'

import type { TFunction } from 'i18next'

export const createAdminTexts = (t: TFunction<'admin'>) => ({
  brand: t(ADMIN_KEYS.BRAND),
  panel: t(ADMIN_KEYS.PANEL),
  systemAdmin: t(ADMIN_KEYS.SYSTEM_ADMIN),
  menu: {
    dashboard: t(ADMIN_KEYS.MENU.DASHBOARD),
    users: t(ADMIN_KEYS.MENU.USERS),
    elasticsearch: t(ADMIN_KEYS.MENU.ELASTICSEARCH),
    logout: t(ADMIN_KEYS.MENU.LOGOUT),
    profile: t(ADMIN_KEYS.MENU.PROFILE),
    changePassword: t(ADMIN_KEYS.MENU.CHANGE_PASSWORD),
    myAccount: t(ADMIN_KEYS.MENU.MY_ACCOUNT),
    language: t(ADMIN_KEYS.MENU.LANGUAGE),
    appearance: t(ADMIN_KEYS.MENU.APPEARANCE),
    themeLight: t(ADMIN_KEYS.MENU.THEME_LIGHT),
    themeDark: t(ADMIN_KEYS.MENU.THEME_DARK),
    themeSystem: t(ADMIN_KEYS.MENU.THEME_SYSTEM)
  },
  header: {
    searchPlaceholder: t(ADMIN_KEYS.HEADER.SEARCH_PLACEHOLDER)
  },
  elasticsearch: {
    modules: {
      users: t(ADMIN_KEYS.ELASTICSEARCH.MODULES.USERS),
      messages: t(ADMIN_KEYS.ELASTICSEARCH.MODULES.MESSAGES),
      groups: t(ADMIN_KEYS.ELASTICSEARCH.MODULES.GROUPS)
    }
  }
})
