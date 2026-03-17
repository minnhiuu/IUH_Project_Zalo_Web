export const ADMIN_KEYS = {
  BRAND: 'admin.brand',
  PANEL: 'admin.panel',
  SYSTEM_ADMIN: 'admin.systemAdmin',
  MENU: {
    DASHBOARD: 'admin.menu.dashboard',
    USERS: 'admin.menu.users',
    ELASTICSEARCH: 'admin.menu.elasticsearch',
    LOGOUT: 'admin.menu.logout',
    PROFILE: 'admin.menu.profile',
    CHANGE_PASSWORD: 'admin.menu.changePassword',
    MY_ACCOUNT: 'admin.menu.myAccount',
    LANGUAGE: 'admin.menu.language',
    APPEARANCE: 'admin.menu.appearance',
    THEME_LIGHT: 'admin.menu.themeLight',
    THEME_DARK: 'admin.menu.themeDark',
    THEME_SYSTEM: 'admin.menu.themeSystem'
  },
  HEADER: {
    SEARCH_PLACEHOLDER: 'admin.header.searchPlaceholder'
  },
  ELASTICSEARCH: {
    MODULES: {
      USERS: 'admin.elasticsearch.modules.users',
      MESSAGES: 'admin.elasticsearch.modules.messages',
      GROUPS: 'admin.elasticsearch.modules.groups'
    }
  }
} as const
