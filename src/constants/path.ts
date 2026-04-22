export const PATHS = {
  HOME: '/',
  SOCIAL_FEED: '/social-feed',
  REELS: '/reels',
  SEARCH: '/search',
  CONTACTS: '/contacts',
  TODO: '/todo',
  NOTIFICATIONS: '/notifications',
  CLOUD: '/cloud',
  BUSINESS: '/business',

  CHAT: {
    CONVERSATION: '/chat/c/:id',
    USER: '/chat/u/:id'
  },

  JOIN_GROUP: '/g/:token',

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
    SEEDING: '/admin/seeding',
    REPORTS: '/admin/reports',
    REPORT_DETAIL: '/admin/reports/:targetType/:targetId',
    ELASTICSEARCH: '/admin/elasticsearch',
    FAILED_EVENTS: '/admin/elasticsearch/failed-events',
    INGEST_DOCUMENT: '/admin/ingest-document',
    VECTOR_STORE: '/admin/vector-store'
  }
} as const
