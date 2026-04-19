export const ADMIN_KEYS = {
  BRAND: 'brand',
  PANEL: 'panel',
  SYSTEM_ADMIN: 'systemAdmin',
  MENU: {
    DASHBOARD: 'menu.dashboard',
    USERS: 'menu.users',
    ELASTICSEARCH: 'menu.elasticsearch',
    LOGOUT: 'menu.logout',
    PROFILE: 'menu.profile',
    CHANGE_PASSWORD: 'menu.changePassword',
    MY_ACCOUNT: 'menu.myAccount',
    LANGUAGE: 'menu.language',
    APPEARANCE: 'menu.appearance',
    THEME_LIGHT: 'menu.themeLight',
    THEME_DARK: 'menu.themeDark',
    THEME_SYSTEM: 'menu.themeSystem'
  },
  HEADER: {
    SEARCH_PLACEHOLDER: 'header.searchPlaceholder'
  },
  ELASTICSEARCH: {
    MODULES: {
      USERS: 'elasticsearch.modules.users',
      MESSAGES: 'elasticsearch.modules.messages',
      GROUPS: 'elasticsearch.modules.groups'
    }
  }
} as const
