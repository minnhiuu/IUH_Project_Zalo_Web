export const PATHS = {
  HOME: '/',
  SEARCH: '/search',
  CONTACTS: '/contacts',
  TODO: '/todo',
  NOTIFICATIONS: '/notifications',
  CLOUD: '/cloud',
  BUSINESS: '/business',

  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password'
  },

  USER: {
    PROFILE: '/profile',
    SETTINGS: '/settings'
  },

  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    ELASTICSEARCH: '/admin/elasticsearch',
    FAILED_EVENTS: '/admin/elasticsearch/failed-events'
  }
} as const
